
import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

const SFTP_PROXY_URL = Deno.env.get("SFTP_PROXY_URL");
const SFTP_PROXY_API_KEY = Deno.env.get("SFTP_PROXY_API_KEY");

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

// Parse HL7 message to extract patient information and detailed parameters
function parseHL7(hl7Content) {
  // HL7 can use different line separators: \r\n (Windows), \n (Unix), or \r (Mac)
  const lines = hl7Content.split(/\r\n|\r|\n/).filter(line => line.trim().length > 0);
  
  const result = {
      patient_name: null,
      patient_email: null,
      patient_id: null,
      date_of_birth: null,
      lab_order_id: null,
      test_date: null,
      clinic_name: null,
      parameters: [] // NEW: Array to hold all test parameters
  };

  for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      const segments = line.split('|');
      const segmentType = segments[0];

      // MSH segment - Message Header (contains receiving facility)
      if (segmentType === 'MSH') {
          // MSH|^~\&|PATH|County Pathology||Transform Now Health Ltd|...
          // Clinic name is usually in field 5 or 6
          if (segments[5] && segments[5].length > 3) {
              result.clinic_name = segments[5].trim();
          } else if (segments[6] && segments[6].length > 3) {
              result.clinic_name = segments[6].trim();
          }
      }

      // PV1 segment - Patient Visit (also contains clinic name)
      if (segmentType === 'PV1') {
          // PV1||O|Transform Now Health Ltd||...
          if (segments[3] && segments[3].length > 3 && !result.clinic_name) {
              result.clinic_name = segments[3].trim();
          }
      }

      // PID segment - Patient Identification
      if (segmentType === 'PID') {
          result.patient_id = segments[2] || segments[3];
          
          // Patient name in field 5: LastName^FirstName
          if (segments[5]) {
              const nameParts = segments[5].split('^');
              if (nameParts.length >= 2) {
                  result.patient_name = `${nameParts[1]} ${nameParts[0]}`.trim();
              } else {
                  result.patient_name = segments[5];
              }
          }
          
          // Date of birth in field 7: YYYYMMDD
          if (segments[7] && segments[7].length >= 8) {
              const dob = segments[7].substring(0, 8);
              if (dob !== '00000000' && dob !== '000000') {
                  result.date_of_birth = `${dob.substring(0,4)}-${dob.substring(4,6)}-${dob.substring(6,8)}`;
              }
          }

          // Email
          if (segments[13] && segments[13].includes('@')) {
              result.patient_email = segments[13].toLowerCase();
          } else if (segments[14] && segments[14].includes('@')) {
              result.patient_email = segments[14].toLowerCase();
          }
      }

      // ORC segment - Order Common
      if (segmentType === 'ORC') {
          result.lab_order_id = segments[2] || segments[3];
      }

      // OBR segment - Observation Request
      if (segmentType === 'OBR') {
          if (!result.lab_order_id) {
              result.lab_order_id = segments[2] || segments[3];
          }
          
          // Test date in field 7: YYYYMMDDHHMMSS
          if (segments[7] && segments[7].length >= 8) {
              const testDate = segments[7].substring(0, 8);
              result.test_date = `${testDate.substring(0,4)}-${testDate.substring(4,6)}-${testDate.substring(6,8)}`;
          }
      }

      // NEW: Parse OBX (Observation/Result) segments
      if (segmentType === 'OBX') {
          try {
              // OBX|1|NM|2165-2^Glucose^LN||90|mg/dL|70-100^N|||N|||20040409150404|||
              // Field 3: OBX-3 Observation Identifier (e.g., 2165-2^Glucose^LN) - we want the second component (Text)
              // Field 5: OBX-5 Observation Value
              // Field 6: OBX-6 Units
              // Field 7: OBX-7 References Range
              // Field 8: OBX-8 Abnormal Flags (e.g., H, L, LL, HH, N, A, AA)

              const paramName = segments[3]?.split('^')[1] || segments[3] || 'Unknown Parameter';
              const paramValue = segments[5];
              const paramUnits = segments[6];
              const paramRange = segments[7];
              const paramStatusFlag = segments[8]; 

              let status = 'normal';
              if (paramStatusFlag === 'H' || paramStatusFlag === 'HH') status = 'high';
              if (paramStatusFlag === 'L' || paramStatusFlag === 'LL') status = 'low';
              if (paramStatusFlag === 'A' || paramStatusFlag === 'AA') status = 'abnormal';

              if (paramName && paramValue) {
                  result.parameters.push({
                      name: paramName.trim(),
                      value: paramValue,
                      unit: paramUnits || '',
                      reference_range: paramRange || '',
                      status: status,
                  });
              }
          } catch (e) {
              console.warn(`⚠️ Could not parse OBX segment in file line "${line}": ${e.message}`);
          }
      }
  }
  return result;
}

// Try to match parsed HL7 data to a user WITHIN THE SAME CLINIC
async function matchToUser(base44, hl7Data) {

    // STEP 1: Find the clinic first
    let clinic = null;
    if (hl7Data.clinic_name) {
        const allClinics = await base44.asServiceRole.entities.Clinic.list();
        // Try exact match first
        clinic = allClinics.find(c => 
            c.clinic_name.toLowerCase() === hl7Data.clinic_name.toLowerCase()
        );
        
        // Try partial match if exact match fails
        if (!clinic) {
            clinic = allClinics.find(c => 
                c.clinic_name.toLowerCase().includes(hl7Data.clinic_name.toLowerCase()) ||
                hl7Data.clinic_name.toLowerCase().includes(c.clinic_name.toLowerCase())
            );
        }
    }

    // STEP 2: Get users ONLY from this clinic
    let clinicUsers = [];
    if (clinic) {
        clinicUsers = await base44.asServiceRole.entities.User.filter({ clinic_id: clinic.id });
    } else {
        console.log("no clinic is found for HL7 data, cannot match user.");
        return { user: null, clinic: null }; // Do not proceed without a clinic
    }

    // STEP 3: Match within clinic users with hierarchical OR logic

    // Strategy 1: Match by email (Highest Confidence)
    if (hl7Data.patient_email) {
        const user = clinicUsers.find(u => u.email?.toLowerCase() === hl7Data.patient_email.toLowerCase());
        if (user) {
            return { user, clinic };
        }
    }

    // Strategy 2: Match by name + DOB (High Confidence)
    if (hl7Data.patient_name && hl7Data.date_of_birth) {
        const user = clinicUsers.find(u => 
            u.full_name?.toLowerCase() === hl7Data.patient_name.toLowerCase() && 
            u.date_of_birth === hl7Data.date_of_birth
        );
        if (user) {
            console.log('✅ Matched by NAME + DOB:', hl7Data.patient_name);
            return { user, clinic };
        }
    }

    // Strategy 3: Match by DOB only (Medium Confidence)
    if (hl7Data.date_of_birth) {
        const user = clinicUsers.find(u => u.date_of_birth === hl7Data.date_of_birth);
        if (user) {
            console.log('⚠️ Matched by DOB ONLY, User ID:', user.id, 'for DOB:', hl7Data.date_of_birth);
            return { user, clinic };
        }
    }

    // Strategy 4: Match by Name only (Low Confidence)
    if (hl7Data.patient_name) {
        const user = clinicUsers.find(u => u.full_name?.toLowerCase() === hl7Data.patient_name.toLowerCase());
        if (user) {
            return { user, clinic };
        }
    }
    
    return { user: null, clinic };
}


Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        
        const base44 = createClientFromRequest(req);

        // Verify user is authenticated
        const requestingUser = await base44.auth.me();
        if (!requestingUser) {
            return Response.json({ 
                error: 'Unauthorized' 
            }, { status: 401, headers: corsHeaders });
        }

        if (!SFTP_PROXY_URL || !SFTP_PROXY_API_KEY) {
            throw new Error('SFTP proxy configuration missing. Please set SFTP_PROXY_URL and SFTP_PROXY_API_KEY');
        }

        // List files from SFTP using the correct endpoint
        const listUrl = `${SFTP_PROXY_URL}/sftp/list?path=/files`;

        const listResponse = await fetch(listUrl, {
            method: 'GET',
            headers: {
                'x-api-key': SFTP_PROXY_API_KEY
            }
        });

        if (!listResponse.ok) {
            const errorText = await listResponse.text();
            let errorDetails = errorText;
            try {
                errorDetails = JSON.parse(errorText);
            } catch {
                // Not JSON, keep as is
            }
            throw new Error(`SFTP proxy list failed with ${listResponse.status}: ${JSON.stringify(errorDetails)}`);
        }

        const listData = await listResponse.json();
        
        const files = listData.files || listData.items || listData || [];
        
        const hl7Files = files.filter(file => {
            const filename = file.name || file.filename || file;
            return typeof filename === 'string' && filename.toLowerCase().endsWith('.hl7');
        });
        
        // --- MODIFIED LOGIC TO PREVENT RE-PROCESSING ---
        // Fetch all existing results that have a filename.
        const existingResults = await base44.asServiceRole.entities.LabResult.filter({
            blood_result_filename: { $ne: null }
        });
        
        // Create a set of filenames that have already been processed.
        const processedFileNames = new Set(existingResults.map(r => r.blood_result_filename));

        let newFilesMatched = 0;
        let unmatchedFiles = [];
        let skippedFilesCount = 0; // New counter

        // Process each HL7 file
        for (const file of hl7Files) {
            const filename = file.name || file.filename || file;
            
            // --- FIX: Skip the file if it's already in our set of processed files ---
            if (processedFileNames.has(filename)) {
                console.log('✅ Already processed, skipping:', filename);
                skippedFilesCount++;
                continue;
            }

            try {
                // Download file content using the correct endpoint
                const downloadUrl = `${SFTP_PROXY_URL}/sftp/get?path=${encodeURIComponent('/files/' + filename)}`;
                
                const downloadResponse = await fetch(downloadUrl, {
                    method: 'GET',
                    headers: {
                        'x-api-key': SFTP_PROXY_API_KEY
                    }
                });

                if (!downloadResponse.ok) {
                    const downloadError = await downloadResponse.text();
                    console.log(`⚠️ Failed to download file "${filename}". Error: ${downloadError.substring(0, 200)}`);
                    unmatchedFiles.push({ name: filename, ...file, reason: `Download failed: ${downloadError.substring(0, 100)}` });
                    continue;
                }

                // File content should be in the response body
                const hl7Content = await downloadResponse.text();
                console.log('📄 Downloaded file size:', hl7Content.length, 'bytes for', filename);

                // Parse HL7 content
                const parsedData = parseHL7(hl7Content);
                console.log('📊 Parsed HL7 summary from', filename + ':', { 
                    patient_name: parsedData.patient_name,
                    patient_email: parsedData.patient_email,
                    lab_order_id: parsedData.lab_order_id,
                    test_date: parsedData.test_date,
                    clinic_name: parsedData.clinic_name,
                    parameters_count: parsedData.parameters.length 
                });

                // Try to match to a user
                const { user: matchedUser, clinic } = await matchToUser(base44, parsedData);
                
                if (matchedUser) {
                    // Determine overall status based on parameters
                    const hasAbnormalParameters = parsedData.parameters.some(p => p.status !== 'normal');
                    let overallStatus = 'normal';
                    let iconColor = 'green';
                    if (hasAbnormalParameters) {
                        overallStatus = 'abnormal'; 
                        iconColor = 'red';
                    }

                    // Create the main lab result record
                    const newLabResult = await base44.asServiceRole.entities.LabResult.create({
                        user_id: matchedUser.id,
                        user_name: matchedUser.full_name,
                        test_name: 'Complete Blood Count', // More descriptive name
                        test_type: 'blood_work',
                        test_date: parsedData.test_date || new Date().toISOString().split('T')[0],
                        status: overallStatus, 
                        icon_color: iconColor, 
                        blood_result_filename: filename,
                        laboratory: clinic ? clinic.clinic_name : 'Unknown Lab',
                        ordered_by: 'Lab Upload',
                        results_summary: `Comprehensive blood test results for ${parsedData.patient_name || 'patient'}.`,
                        created_by: requestingUser.email 
                    });
                    
                    // Bulk create all parameters
                    if (parsedData.parameters.length > 0) {
                        const parametersToCreate = parsedData.parameters.map(param => ({
                            ...param,
                            lab_result_id: newLabResult.id
                        }));
                        await base44.asServiceRole.entities.LabResultParameter.bulkCreate(parametersToCreate);
                        console.log(`📝 Saved ${parametersToCreate.length} parameters for result ${newLabResult.id}`);
                    }

                    newFilesMatched++;
                    console.log(`✅ Processed ${filename} for user: ${matchedUser.full_name} (ID: ${matchedUser.id}). Created LabResult ID: ${newLabResult.id}`);
                    if (clinic) {
                        console.log(`   Clinic: ${clinic.clinic_name}`);
                    }

                    // Move file to archive folder AFTER successful processing and database writes
                    const moveUrl = `${SFTP_PROXY_URL}/sftp/move`;
                    const moveResponse = await fetch(moveUrl, {
                        method: 'POST',
                        headers: { 'x-api-key': SFTP_PROXY_API_KEY, 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            from_path: `/files/${filename}`,
                            to_path: `/files/archive/${filename}`
                        })
                    });

                    if (!moveResponse.ok) {
                        const moveError = await moveResponse.text();
                        console.error(`❌ Failed to archive file ${filename}. Error: ${moveError.substring(0, 200)}`);
                    } else {
                        console.log(`🗂️ Archived file: ${filename}`);
                    }

                } else {
                    unmatchedFiles.push({ 
                        name: filename,
                        ...file,
                        parsed_data_preview: { 
                            patient_name: parsedData.patient_name,
                            patient_email: parsedData.patient_email,
                            date_of_birth: parsedData.date_of_birth,
                            clinic_name: clinic ? clinic.clinic_name : parsedData.clinic_name, 
                        },
                        reason: 'No matching user found'
                    });
                    if (clinic) {
                        console.log(`   Clinic identified: ${clinic.clinic_name}, but no user match for ${filename}.`);
                    } else {
                        console.log(`   No clinic or user match for ${filename}.`);
                    }
                }

            } catch (error) {
                console.error(`❌ Error processing ${filename}:`, error);
                unmatchedFiles.push({ name: filename, ...file, reason: error.message });
            }
        }

        return Response.json({
            success: true,
            total_files_scanned: hl7Files.length,
            new_files_matched: newFilesMatched,
            files_already_processed: skippedFilesCount, // Renamed for clarity
            unmatched_files_count: unmatchedFiles.length,
            unmatched_files_details: unmatchedFiles, 
            message: `Successfully processed ${newFilesMatched} new reports and skipped ${skippedFilesCount} already processed.`
        }, { headers: corsHeaders });

    } catch (error) {
        console.error('❌ Top-level error in listBloodResults:', error);
        console.error('❌ Error stack:', error.stack);
        return Response.json({ 
            error: 'Failed to process blood results',
            details: error.message
        }, { status: 500, headers: corsHeaders });
    }
});
