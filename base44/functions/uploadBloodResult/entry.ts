import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

// Parse HL7 message to extract patient information and detailed parameters
function parseHL7(hl7Content) {
  const lines = hl7Content.split(/\r\n|\r|\n/).filter(line => line.trim().length > 0);
  
  const result = {
      patient_name: null,
      patient_email: null,
      patient_id: null,
      date_of_birth: null,
      lab_order_id: null,
      test_date: null,
      clinic_name: null,
      parameters: []
  };

  for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      const segments = line.split('|');
      const segmentType = segments[0];

      if (segmentType === 'MSH') {
          if (segments[5] && segments[5].length > 3) {
              result.clinic_name = segments[5].trim();
          } else if (segments[6] && segments[6].length > 3) {
              result.clinic_name = segments[6].trim();
          }
      }

      if (segmentType === 'PV1') {
          if (segments[3] && segments[3].length > 3 && !result.clinic_name) {
              result.clinic_name = segments[3].trim();
          }
      }

      if (segmentType === 'PID') {
          result.patient_id = segments[2] || segments[3];
          
          if (segments[5]) {
              const nameParts = segments[5].split('^');
              if (nameParts.length >= 2) {
                  result.patient_name = `${nameParts[1]} ${nameParts[0]}`.trim();
              } else {
                  result.patient_name = segments[5];
              }
          }
          
          if (segments[7] && segments[7].length >= 8) {
              const dob = segments[7].substring(0, 8);
              if (dob !== '00000000' && dob !== '000000') {
                  result.date_of_birth = `${dob.substring(0,4)}-${dob.substring(4,6)}-${dob.substring(6,8)}`;
              }
          }

          if (segments[13] && segments[13].includes('@')) {
              result.patient_email = segments[13].toLowerCase();
          } else if (segments[14] && segments[14].includes('@')) {
              result.patient_email = segments[14].toLowerCase();
          }
      }

      if (segmentType === 'ORC') {
          result.lab_order_id = segments[2] || segments[3];
      }

      if (segmentType === 'OBR') {
          if (!result.lab_order_id) {
              result.lab_order_id = segments[2] || segments[3];
          }
          
          if (segments[7] && segments[7].length >= 8) {
              const testDate = segments[7].substring(0, 8);
              result.test_date = `${testDate.substring(0,4)}-${testDate.substring(4,6)}-${testDate.substring(6,8)}`;
          }
      }

      if (segmentType === 'OBX') {
          try {
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
              console.warn(`⚠️ Could not parse OBX segment: ${e.message}`);
          }
      }
  }
  return result;
}

// Try to match parsed HL7 data to a user WITHIN THE SAME CLINIC
async function matchToUser(base44, hl7Data) {
    let clinic = null;
    if (hl7Data.clinic_name) {
        const allClinics = await base44.asServiceRole.entities.Clinic.list();
        clinic = allClinics.find(c => 
            c.clinic_name.toLowerCase() === hl7Data.clinic_name.toLowerCase()
        );
        
        if (!clinic) {
            clinic = allClinics.find(c => 
                c.clinic_name.toLowerCase().includes(hl7Data.clinic_name.toLowerCase()) ||
                hl7Data.clinic_name.toLowerCase().includes(c.clinic_name.toLowerCase())
            );
        }
    }

    let clinicUsers = [];
    if (clinic) {
        clinicUsers = await base44.asServiceRole.entities.User.filter({ clinic_id: clinic.id });
    } else {
        console.log("No clinic found for HL7 data, will save as unmatched");
        return { user: null, clinic: null };
    }

    // Match by email
    if (hl7Data.patient_email) {
        const user = clinicUsers.find(u => u.email?.toLowerCase() === hl7Data.patient_email.toLowerCase());
        if (user) return { user, clinic };
    }

    // Match by name + DOB
    if (hl7Data.patient_name && hl7Data.date_of_birth) {
        const user = clinicUsers.find(u => 
            u.full_name?.toLowerCase() === hl7Data.patient_name.toLowerCase() && 
            u.date_of_birth === hl7Data.date_of_birth
        );
        if (user) return { user, clinic };
    }

    // Match by DOB only
    if (hl7Data.date_of_birth) {
        const user = clinicUsers.find(u => u.date_of_birth === hl7Data.date_of_birth);
        if (user) return { user, clinic };
    }

    // Match by Name only
    if (hl7Data.patient_name) {
        const user = clinicUsers.find(u => u.full_name?.toLowerCase() === hl7Data.patient_name.toLowerCase());
        if (user) return { user, clinic };
    }
    
    return { user: null, clinic };
}

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (user?.role !== 'admin') {
            return Response.json({ 
                error: 'Forbidden: Admin access required' 
            }, { status: 403, headers: corsHeaders });
        }

        const formData = await req.formData();
        const file = formData.get('file');

        if (!file) {
            return Response.json({ 
                error: 'No file provided' 
            }, { status: 400, headers: corsHeaders });
        }

        const filename = file.name;
        const hl7Content = await file.text();
        
        console.log('📤 Processing uploaded file:', filename);
        console.log('Content length:', hl7Content.length);

        const parsedData = parseHL7(hl7Content);
        console.log('📊 Parsed data:', {
            patient: parsedData.patient_name,
            clinic: parsedData.clinic_name,
            params: parsedData.parameters.length
        });

        const { user: matchedUser, clinic } = await matchToUser(base44, parsedData);

        const hasAbnormalParameters = parsedData.parameters.some(p => p.status !== 'normal');
        const abnormalCount = parsedData.parameters.filter(p => p.status !== 'normal').length;
        const totalParams = parsedData.parameters.length;
        const overallStatus = hasAbnormalParameters ? 'abnormal' : 'normal';
        const iconColor = hasAbnormalParameters ? 'red' : 'green';

        const statusBreakdown = hasAbnormalParameters 
            ? `${abnormalCount} of ${totalParams} parameters outside normal range`
            : `All ${totalParams} parameters within normal range`;

        const matchStatus = matchedUser 
            ? `Matched to: ${matchedUser.full_name}` 
            : `UNMATCHED - Patient: ${parsedData.patient_name || 'Unknown'}, DOB: ${parsedData.date_of_birth || 'N/A'}, Email: ${parsedData.patient_email || 'N/A'}`;

        const newLabResult = await base44.asServiceRole.entities.LabResult.create({
            user_id: matchedUser?.id || 'UNMATCHED',
            user_name: matchedUser?.full_name || parsedData.patient_name || 'Unknown Patient',
            test_name: 'Complete Blood Count',
            test_type: 'blood_work',
            test_date: parsedData.test_date || new Date().toISOString().split('T')[0],
            status: overallStatus,
            approval_status: 'pending',
            icon_color: iconColor,
            blood_result_filename: filename,
            laboratory: clinic ? clinic.clinic_name : (parsedData.clinic_name || 'Unknown Lab'),
            ordered_by: 'Manual Upload',
            results_summary: `${statusBreakdown}. ${matchStatus}`
        });
        
        if (parsedData.parameters.length > 0) {
            const parametersToCreate = parsedData.parameters.map(param => ({
                ...param,
                lab_result_id: newLabResult.id
            }));
            await base44.asServiceRole.entities.LabResultParameter.bulkCreate(parametersToCreate);
            console.log(`📝 Saved ${parametersToCreate.length} parameters`);
        }

        console.log(`✅ Uploaded ${filename} for ${matchedUser?.full_name || 'UNMATCHED: ' + parsedData.patient_name}`);

        return Response.json({
            success: true,
            message: 'Blood test result uploaded successfully',
            result: {
                id: newLabResult.id,
                patient: matchedUser?.full_name || parsedData.patient_name,
                matched: !!matchedUser,
                parameters_count: parsedData.parameters.length
            }
        }, { headers: corsHeaders });

    } catch (error) {
        console.error('❌ Upload error:', error);
        return Response.json({ 
            error: 'Upload failed',
            details: error.message
        }, { status: 500, headers: corsHeaders });
    }
});