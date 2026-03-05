import { Router } from 'express';
import SftpClient from 'ssh2-sftp-client';
import { requireAuth } from '../server.js';

export const router = Router();

router.post('/', requireAuth, async (req, res) => {
    const sftp = new SftpClient();

    try {
        const { filename, action } = req.body;
        if (!filename) return res.status(400).json({ error: 'filename is required' });

        const config = {
            host: process.env.SFTP_HOST,
            port: parseInt(process.env.SFTP_PORT || '22'),
            username: process.env.SFTP_USERNAME,
            password: process.env.SFTP_PASSWORD,
        };

        if (!config.host) return res.status(500).json({ error: 'SFTP not configured' });

        await sftp.connect(config);

        // Try archive first, then original location
        let fileBuffer;
        const paths = [`/files/archive/${filename}`, `/files/${filename}`];

        for (const path of paths) {
            try {
                const exists = await sftp.exists(path);
                if (exists) {
                    fileBuffer = await sftp.get(path);
                    break;
                }
            } catch (e) { /* try next */ }
        }

        await sftp.end();

        if (!fileBuffer) {
            return res.status(404).json({ error: `File not found: ${filename}` });
        }

        const fileType = filename.split('.').pop().toUpperCase();
        const contentType = fileType === 'HL7' ? 'text/plain' : 'application/pdf';
        const disposition = action === 'view'
            ? `inline; filename="${filename}"`
            : `attachment; filename="${filename}"`;

        res.set({ 'Content-Type': contentType, 'Content-Disposition': disposition });
        res.send(Buffer.from(fileBuffer));

    } catch (error) {
        try { await sftp.end(); } catch (e) { /* ignore */ }
        console.error('💥 Download error:', error);
        res.status(500).json({ error: 'Failed to download file', details: error.message });
    }
});
