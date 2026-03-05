import { Router } from 'express';
import { supabaseAdmin, requireAdmin } from '../server.js';

export const router = Router();

// ─── HL7 Parser ─────────────────────────────────────────────────
// Parse HL7 message to extract patient information and parameters
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

    for (const line of lines) {
        const segments = line.trim().split('|');
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
                    result.date_of_birth = `${dob.substring(0, 4)}-${dob.substring(4, 6)}-${dob.substring(6, 8)}`;
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
                result.test_date = `${testDate.substring(0, 4)}-${testDate.substring(4, 6)}-${testDate.substring(6, 8)}`;
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
                        status,
                    });
                }
            } catch (e) {
                console.warn(`⚠️ Could not parse OBX segment: ${e.message}`);
            }
        }
    }
    return result;
}

// ─── Patient Matching ───────────────────────────────────────────
async function matchToUser(hl7Data) {
    let clinic = null;

    if (hl7Data.clinic_name) {
        const { data: clinics } = await supabaseAdmin.from('clinics').select('*');
        if (clinics) {
            clinic = clinics.find(c =>
                c.clinic_name.toLowerCase() === hl7Data.clinic_name.toLowerCase()
            );
            if (!clinic) {
                clinic = clinics.find(c =>
                    c.clinic_name.toLowerCase().includes(hl7Data.clinic_name.toLowerCase()) ||
                    hl7Data.clinic_name.toLowerCase().includes(c.clinic_name.toLowerCase())
                );
            }
        }
    }

    let clinicUsers = [];
    if (clinic) {
        const { data } = await supabaseAdmin.from('profiles').select('*').eq('clinic_id', clinic.id);
        clinicUsers = data || [];
    } else {
        console.log('No clinic found for HL7 data, cannot match user.');
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

    // Match by name only
    if (hl7Data.patient_name) {
        const user = clinicUsers.find(u => u.full_name?.toLowerCase() === hl7Data.patient_name.toLowerCase());
        if (user) return { user, clinic };
    }

    return { user: null, clinic };
}

// ─── Main Sync Route ────────────────────────────────────────────
router.post('/', requireAdmin, async (req, res) => {
    try {
        const SFTP_PROXY_URL = process.env.SFTP_PROXY_URL;
        const SFTP_PROXY_API_KEY = process.env.SFTP_PROXY_API_KEY;

        if (!SFTP_PROXY_URL || !SFTP_PROXY_API_KEY) {
            return res.status(500).json({ error: 'SFTP proxy configuration missing' });
        }

        console.log('✅ Blood results sync started...');

        // List files from SFTP
        const listUrl = `${SFTP_PROXY_URL}/sftp/list?path=/files`;
        const listResponse = await fetch(listUrl, {
            method: 'GET',
            headers: { 'x-api-key': SFTP_PROXY_API_KEY }
        });

        if (!listResponse.ok) {
            throw new Error(`SFTP list failed: ${listResponse.status}`);
        }

        const listData = await listResponse.json();
        const files = listData.files || listData.items || listData || [];

        const hl7Files = files.filter(file => {
            const filename = file.name || file.filename || file;
            return typeof filename === 'string' && filename.toLowerCase().endsWith('.hl7');
        });

        const pdfFiles = files.filter(file => {
            const filename = file.name || file.filename || file;
            return typeof filename === 'string' && filename.toLowerCase().endsWith('.pdf');
        });

        // Get already processed files
        const { data: existingResults } = await supabaseAdmin
            .from('lab_results')
            .select('blood_result_filename')
            .not('blood_result_filename', 'is', null);

        const processedFileNames = new Set((existingResults || []).map(r => r.blood_result_filename));

        let newFilesMatched = 0;
        let unmatchedFiles = [];
        let skippedFilesCount = 0;
        let pdfsMatched = 0;
        let pdfsSkipped = 0;

        // Process each HL7 file
        for (const file of hl7Files) {
            const filename = file.name || file.filename || file;
            if (processedFileNames.has(filename)) {
                console.log('✅ Already processed, skipping:', filename);
                skippedFilesCount++;
                continue;
            }

            try {
                const downloadUrl = `${SFTP_PROXY_URL}/sftp/get?path=${encodeURIComponent('/files/' + filename)}`;
                const downloadResponse = await fetch(downloadUrl, {
                    method: 'GET',
                    headers: { 'x-api-key': SFTP_PROXY_API_KEY }
                });

                if (!downloadResponse.ok) {
                    console.log(`⚠️ Failed to download ${filename}`);
                    unmatchedFiles.push({ name: filename, reason: 'Download failed' });
                    continue;
                }

                const hl7Content = await downloadResponse.text();
                const parsedData = parseHL7(hl7Content);

                console.log('📊 Parsed:', filename, {
                    patient: parsedData.patient_name,
                    clinic: parsedData.clinic_name,
                    params: parsedData.parameters.length
                });

                const { user: matchedUser, clinic } = await matchToUser(parsedData);

                // Save regardless of user match (admin can assign later)
                const hasAbnormalParameters = parsedData.parameters.some(p => p.status !== 'normal');
                const abnormalCount = parsedData.parameters.filter(p => p.status !== 'normal').length;
                const totalParams = parsedData.parameters.length;
                const overallStatus = hasAbnormalParameters ? 'abnormal' : 'normal';

                const statusBreakdown = hasAbnormalParameters
                    ? `${abnormalCount} of ${totalParams} parameters outside normal range`
                    : `All ${totalParams} parameters within normal range`;

                const matchStatus = matchedUser
                    ? `Matched to: ${matchedUser.full_name}`
                    : `UNMATCHED - Patient: ${parsedData.patient_name || 'Unknown'}, DOB: ${parsedData.date_of_birth || 'N/A'}`;

                // Create lab result
                const { data: newLabResult, error: createErr } = await supabaseAdmin
                    .from('lab_results')
                    .insert({
                        user_id: matchedUser?.id || 'UNMATCHED',
                        user_name: matchedUser?.full_name || parsedData.patient_name || 'Unknown Patient',
                        test_name: 'Complete Blood Count',
                        test_type: 'blood_work',
                        test_date: parsedData.test_date || new Date().toISOString().split('T')[0],
                        status: overallStatus,
                        approval_status: 'pending',
                        icon_color: hasAbnormalParameters ? 'red' : 'green',
                        blood_result_filename: filename,
                        laboratory: clinic ? clinic.clinic_name : (parsedData.clinic_name || 'Unknown Lab'),
                        ordered_by: 'Automated Sync',
                        results_summary: `${statusBreakdown}. ${matchStatus}`
                    })
                    .select()
                    .single();

                if (createErr) throw createErr;

                // Create parameters
                if (parsedData.parameters.length > 0) {
                    const parametersToCreate = parsedData.parameters.map(param => ({
                        ...param,
                        lab_result_id: newLabResult.id
                    }));
                    const { error: paramErr } = await supabaseAdmin
                        .from('lab_result_parameters')
                        .insert(parametersToCreate);
                    if (paramErr) console.error('⚠️ Error saving parameters:', paramErr);
                    else console.log(`📝 Saved ${parametersToCreate.length} parameters`);
                }

                newFilesMatched++;
                console.log(`✅ Processed ${filename} for ${matchedUser?.full_name || 'UNMATCHED: ' + parsedData.patient_name}`);

                // Archive file
                const moveUrl = `${SFTP_PROXY_URL}/sftp/move`;
                const moveResponse = await fetch(moveUrl, {
                    method: 'POST',
                    headers: { 'x-api-key': SFTP_PROXY_API_KEY, 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        from_path: `/files/${filename}`,
                        to_path: `/files/archive/${filename}`
                    })
                });
                if (moveResponse.ok) console.log(`🗂️ Archived: ${filename}`);

            } catch (error) {
                console.error(`❌ Error processing ${filename}:`, error);
                unmatchedFiles.push({ name: filename, reason: error.message });
            }
        }

        // Process PDF files — try to match to existing LabResults
        for (const file of pdfFiles) {
            const filename = file.name || file.filename || file;

            const { data: existingWithPdf } = await supabaseAdmin
                .from('lab_results')
                .select('id')
                .eq('blood_result_filename', filename);

            if (existingWithPdf && existingWithPdf.length > 0) {
                pdfsSkipped++;
                continue;
            }

            try {
                const { data: recentResults } = await supabaseAdmin
                    .from('lab_results')
                    .select('*')
                    .is('blood_result_filename', null)
                    .order('created_date', { ascending: false });

                let matched = false;
                for (const result of (recentResults || [])) {
                    const resultNameParts = result.user_name?.toLowerCase().split(' ') || [];
                    const filenameLower = filename.toLowerCase();
                    const nameMatch = resultNameParts.every(part =>
                        part.length > 2 && filenameLower.includes(part)
                    );

                    if (nameMatch) {
                        await supabaseAdmin
                            .from('lab_results')
                            .update({ blood_result_filename: filename })
                            .eq('id', result.id);

                        console.log(`✅ Matched PDF "${filename}" to ${result.user_name}`);
                        pdfsMatched++;
                        matched = true;

                        // Archive PDF
                        await fetch(`${SFTP_PROXY_URL}/sftp/move`, {
                            method: 'POST',
                            headers: { 'x-api-key': SFTP_PROXY_API_KEY, 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                from_path: `/files/${filename}`,
                                to_path: `/files/archive/${filename}`
                            })
                        });
                        break;
                    }
                }
                if (!matched) console.log(`⚠️ Could not match PDF: ${filename}`);
            } catch (error) {
                console.error(`❌ Error processing PDF ${filename}:`, error);
            }
        }

        const response = {
            success: true,
            sync_timestamp: new Date().toISOString(),
            total_files_scanned: hl7Files.length,
            total_pdfs_scanned: pdfFiles.length,
            new_files_matched: newFilesMatched,
            files_already_processed: skippedFilesCount,
            pdfs_matched: pdfsMatched,
            pdfs_skipped: pdfsSkipped,
            unmatched_files_count: unmatchedFiles.length,
            unmatched_files: unmatchedFiles,
            message: `Sync completed: ${newFilesMatched} new HL7s, ${skippedFilesCount} skipped, ${pdfsMatched} PDFs matched`
        };

        console.log('✅ Blood results sync complete:', response.message);
        res.json(response);

    } catch (error) {
        console.error('❌ Blood results sync error:', error);
        res.status(500).json({ error: 'Sync failed', details: error.message });
    }
});

// ─── Upload HL7 File ────────────────────────────────────────────
router.post('/upload', requireAdmin, async (req, res) => {
    try {
        const { hl7Content, filename } = req.body;

        if (!hl7Content) {
            return res.status(400).json({ error: 'hl7Content is required' });
        }

        const parsedData = parseHL7(hl7Content);
        const { user: matchedUser, clinic } = await matchToUser(parsedData);

        const hasAbnormalParameters = parsedData.parameters.some(p => p.status !== 'normal');
        const abnormalCount = parsedData.parameters.filter(p => p.status !== 'normal').length;
        const totalParams = parsedData.parameters.length;

        const { data: newLabResult, error: createErr } = await supabaseAdmin
            .from('lab_results')
            .insert({
                user_id: matchedUser?.id || 'UNMATCHED',
                user_name: matchedUser?.full_name || parsedData.patient_name || 'Unknown Patient',
                test_name: 'Complete Blood Count',
                test_type: 'blood_work',
                test_date: parsedData.test_date || new Date().toISOString().split('T')[0],
                status: hasAbnormalParameters ? 'abnormal' : 'normal',
                approval_status: 'pending',
                icon_color: hasAbnormalParameters ? 'red' : 'green',
                blood_result_filename: filename || `upload_${Date.now()}.hl7`,
                laboratory: clinic ? clinic.clinic_name : (parsedData.clinic_name || 'Unknown Lab'),
                ordered_by: 'Manual Upload',
                results_summary: `${hasAbnormalParameters ? abnormalCount + ' of ' + totalParams + ' parameters outside normal range' : 'All ' + totalParams + ' parameters within normal range'}. ${matchedUser ? 'Matched to: ' + matchedUser.full_name : 'UNMATCHED'}`
            })
            .select()
            .single();

        if (createErr) throw createErr;

        // Create parameters
        if (parsedData.parameters.length > 0) {
            await supabaseAdmin
                .from('lab_result_parameters')
                .insert(parsedData.parameters.map(param => ({
                    ...param,
                    lab_result_id: newLabResult.id
                })));
        }

        res.json({
            success: true,
            result: {
                id: newLabResult.id,
                patient: parsedData.patient_name,
                matched: !!matchedUser,
                parameters_count: parsedData.parameters.length
            }
        });

    } catch (error) {
        console.error('❌ Upload error:', error);
        res.status(500).json({ error: 'Upload failed', details: error.message });
    }
});
