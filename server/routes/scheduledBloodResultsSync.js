import { Router } from 'express';
import SftpClient from 'ssh2-sftp-client';
import { supabaseAdmin, requireAdmin } from '../server.js';

export const router = Router();

// ─── SFTP config from env ───────────────────────────────────────
function getSftpConfig() {
    return {
        host: process.env.SFTP_HOST,
        port: parseInt(process.env.SFTP_PORT || '22'),
        username: process.env.SFTP_USERNAME,
        password: process.env.SFTP_PASSWORD,
    };
}

// ─── HL7 Parser ─────────────────────────────────────────────────
function parseHL7(hl7Content) {
    const lines = hl7Content.split(/\r\n|\r|\n/).filter(line => line.trim().length > 0);
    const result = {
        patient_name: null, patient_email: null, patient_id: null,
        date_of_birth: null, lab_order_id: null, test_date: null,
        clinic_name: null, parameters: []
    };

    for (const line of lines) {
        const segments = line.trim().split('|');
        const segmentType = segments[0];

        if (segmentType === 'MSH') {
            if (segments[5]?.length > 3) result.clinic_name = segments[5].trim();
            else if (segments[6]?.length > 3) result.clinic_name = segments[6].trim();
        }

        if (segmentType === 'PV1') {
            if (segments[3]?.length > 3 && !result.clinic_name) result.clinic_name = segments[3].trim();
        }

        if (segmentType === 'PID') {
            result.patient_id = segments[2] || segments[3];
            if (segments[5]) {
                const nameParts = segments[5].split('^');
                result.patient_name = nameParts.length >= 2
                    ? `${nameParts[1]} ${nameParts[0]}`.trim()
                    : segments[5];
            }
            if (segments[7]?.length >= 8) {
                const dob = segments[7].substring(0, 8);
                if (dob !== '00000000' && dob !== '000000') {
                    result.date_of_birth = `${dob.substring(0, 4)}-${dob.substring(4, 6)}-${dob.substring(6, 8)}`;
                }
            }
            if (segments[13]?.includes('@')) result.patient_email = segments[13].toLowerCase();
            else if (segments[14]?.includes('@')) result.patient_email = segments[14].toLowerCase();
        }

        if (segmentType === 'ORC') result.lab_order_id = segments[2] || segments[3];

        if (segmentType === 'OBR') {
            if (!result.lab_order_id) result.lab_order_id = segments[2] || segments[3];
            if (segments[7]?.length >= 8) {
                const d = segments[7].substring(0, 8);
                result.test_date = `${d.substring(0, 4)}-${d.substring(4, 6)}-${d.substring(6, 8)}`;
            }
        }

        if (segmentType === 'OBX') {
            try {
                const paramName = segments[3]?.split('^')[1] || segments[3] || 'Unknown';
                const paramValue = segments[5];
                const flag = segments[8];
                let status = 'normal';
                if (flag === 'H' || flag === 'HH') status = 'high';
                if (flag === 'L' || flag === 'LL') status = 'low';
                if (flag === 'A' || flag === 'AA') status = 'abnormal';
                if (paramName && paramValue) {
                    result.parameters.push({
                        name: paramName.trim(), value: paramValue,
                        unit: segments[6] || '', reference_range: segments[7] || '',
                        status,
                    });
                }
            } catch (e) { /* skip bad OBX */ }
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
            clinic = clinics.find(c => c.clinic_name.toLowerCase() === hl7Data.clinic_name.toLowerCase());
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
        return { user: null, clinic: null };
    }

    if (hl7Data.patient_email) {
        const user = clinicUsers.find(u => u.email?.toLowerCase() === hl7Data.patient_email.toLowerCase());
        if (user) return { user, clinic };
    }
    if (hl7Data.patient_name && hl7Data.date_of_birth) {
        const user = clinicUsers.find(u =>
            u.full_name?.toLowerCase() === hl7Data.patient_name.toLowerCase() &&
            u.date_of_birth === hl7Data.date_of_birth
        );
        if (user) return { user, clinic };
    }
    if (hl7Data.date_of_birth) {
        const user = clinicUsers.find(u => u.date_of_birth === hl7Data.date_of_birth);
        if (user) return { user, clinic };
    }
    if (hl7Data.patient_name) {
        const user = clinicUsers.find(u => u.full_name?.toLowerCase() === hl7Data.patient_name.toLowerCase());
        if (user) return { user, clinic };
    }

    return { user: null, clinic };
}

// ─── Main Sync Route ────────────────────────────────────────────
router.post('/', requireAdmin, async (req, res) => {
    const sftp = new SftpClient();

    try {
        const config = getSftpConfig();
        if (!config.host || !config.username) {
            return res.status(500).json({ error: 'SFTP not configured — set SFTP_HOST, SFTP_USERNAME, SFTP_PASSWORD in server/.env' });
        }

        console.log(`🔌 Connecting to SFTP ${config.host}:${config.port}...`);
        await sftp.connect(config);
        console.log('✅ SFTP connected.');

        // List files from /files directory
        const fileList = await sftp.list('/files');
        const hl7Files = fileList.filter(f => f.name.toLowerCase().endsWith('.hl7'));
        const pdfFiles = fileList.filter(f => f.name.toLowerCase().endsWith('.pdf'));

        console.log(`📂 Found ${hl7Files.length} HL7 files, ${pdfFiles.length} PDF files`);

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

        // Process each HL7 file
        for (const file of hl7Files) {
            if (processedFileNames.has(file.name)) {
                skippedFilesCount++;
                continue;
            }

            try {
                // Download file content as text
                const hl7Buffer = await sftp.get(`/files/${file.name}`);
                const hl7Content = hl7Buffer.toString('utf8');
                const parsedData = parseHL7(hl7Content);

                console.log('📊 Parsed:', file.name, {
                    patient: parsedData.patient_name,
                    clinic: parsedData.clinic_name,
                    params: parsedData.parameters.length
                });

                const { user: matchedUser, clinic } = await matchToUser(parsedData);

                const hasAbnormal = parsedData.parameters.some(p => p.status !== 'normal');
                const abnormalCount = parsedData.parameters.filter(p => p.status !== 'normal').length;
                const totalParams = parsedData.parameters.length;

                const statusBreakdown = hasAbnormal
                    ? `${abnormalCount} of ${totalParams} parameters outside normal range`
                    : `All ${totalParams} parameters within normal range`;

                const matchStatus = matchedUser
                    ? `Matched to: ${matchedUser.full_name}`
                    : `UNMATCHED - ${parsedData.patient_name || 'Unknown'}`;

                const { data: newLabResult, error: createErr } = await supabaseAdmin
                    .from('lab_results')
                    .insert({
                        user_id: matchedUser?.id || 'UNMATCHED',
                        user_name: matchedUser?.full_name || parsedData.patient_name || 'Unknown Patient',
                        test_name: 'Complete Blood Count',
                        test_type: 'blood_work',
                        test_date: parsedData.test_date || new Date().toISOString().split('T')[0],
                        status: hasAbnormal ? 'abnormal' : 'normal',
                        approval_status: 'pending',
                        icon_color: hasAbnormal ? 'red' : 'green',
                        blood_result_filename: file.name,
                        laboratory: clinic?.clinic_name || parsedData.clinic_name || 'Unknown Lab',
                        ordered_by: 'Automated Sync',
                        results_summary: `${statusBreakdown}. ${matchStatus}`
                    })
                    .select().single();

                if (createErr) throw createErr;

                if (parsedData.parameters.length > 0) {
                    const { error: paramErr } = await supabaseAdmin
                        .from('lab_result_parameters')
                        .insert(parsedData.parameters.map(p => ({ ...p, lab_result_id: newLabResult.id })));
                    if (paramErr) console.error('⚠️ Params error:', paramErr.message);
                    else console.log(`📝 Saved ${parsedData.parameters.length} parameters`);
                }

                newFilesMatched++;
                console.log(`✅ Processed ${file.name} → ${matchedUser?.full_name || 'UNMATCHED'}`);

                // Archive file
                try {
                    // Ensure archive dir exists
                    try { await sftp.mkdir('/files/archive', true); } catch (e) { /* exists */ }
                    await sftp.rename(`/files/${file.name}`, `/files/archive/${file.name}`);
                    console.log(`🗂️ Archived: ${file.name}`);
                } catch (moveErr) {
                    console.warn(`⚠️ Could not archive ${file.name}: ${moveErr.message}`);
                }

            } catch (error) {
                console.error(`❌ Error processing ${file.name}:`, error.message);
                unmatchedFiles.push({ name: file.name, reason: error.message });
            }
        }

        // Process PDF files — match to existing LabResults
        for (const file of pdfFiles) {
            const { data: existingWithPdf } = await supabaseAdmin
                .from('lab_results')
                .select('id')
                .eq('blood_result_filename', file.name);

            if (existingWithPdf?.length > 0) continue;

            try {
                const { data: recentResults } = await supabaseAdmin
                    .from('lab_results')
                    .select('*')
                    .is('blood_result_filename', null)
                    .order('created_date', { ascending: false });

                for (const result of (recentResults || [])) {
                    const nameParts = result.user_name?.toLowerCase().split(' ') || [];
                    const filenameLower = file.name.toLowerCase();
                    const nameMatch = nameParts.every(part => part.length > 2 && filenameLower.includes(part));

                    if (nameMatch) {
                        await supabaseAdmin.from('lab_results')
                            .update({ blood_result_filename: file.name })
                            .eq('id', result.id);

                        console.log(`✅ Matched PDF "${file.name}" → ${result.user_name}`);
                        pdfsMatched++;

                        try {
                            try { await sftp.mkdir('/files/archive', true); } catch (e) { /* exists */ }
                            await sftp.rename(`/files/${file.name}`, `/files/archive/${file.name}`);
                        } catch (e) { /* ignore */ }
                        break;
                    }
                }
            } catch (error) {
                console.error(`❌ Error processing PDF ${file.name}:`, error.message);
            }
        }

        await sftp.end();

        const response = {
            success: true,
            sync_timestamp: new Date().toISOString(),
            total_files_scanned: hl7Files.length,
            total_pdfs_scanned: pdfFiles.length,
            new_files_matched: newFilesMatched,
            files_already_processed: skippedFilesCount,
            pdfs_matched: pdfsMatched,
            unmatched_files_count: unmatchedFiles.length,
            unmatched_files: unmatchedFiles,
            message: `Sync completed: ${newFilesMatched} new HL7s, ${skippedFilesCount} skipped, ${pdfsMatched} PDFs matched`
        };

        console.log('✅ Blood results sync complete:', response.message);
        res.json(response);

    } catch (error) {
        try { await sftp.end(); } catch (e) { /* ignore */ }
        console.error('❌ Blood results sync error:', error);
        res.status(500).json({ error: 'Sync failed', details: error.message });
    }
});
