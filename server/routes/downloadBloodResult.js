import { Router } from 'express';
import { requireAuth } from '../server.js';

export const router = Router();

const SFTP_PROXY_URL = process.env.SFTP_PROXY_URL;
const SFTP_PROXY_API_KEY = process.env.SFTP_PROXY_API_KEY;

router.post('/', requireAuth, async (req, res) => {
    try {
        const { filename, action } = req.body;

        if (!filename) {
            return res.status(400).json({ error: 'filename is required' });
        }

        // Try archive first, then original location
        const paths = [`/files/archive/${filename}`, `/files/${filename}`];
        let fileResponse;

        for (const path of paths) {
            const url = `${SFTP_PROXY_URL}/sftp/get?path=${encodeURIComponent(path)}`;
            fileResponse = await fetch(url, {
                method: 'GET',
                headers: { 'x-api-key': SFTP_PROXY_API_KEY },
            });
            if (fileResponse.ok) break;
        }

        if (!fileResponse?.ok) {
            throw new Error(`File not found: ${filename}`);
        }

        const fileBuffer = await fileResponse.arrayBuffer();
        const fileType = filename.split('.').pop().toUpperCase();
        const contentType = fileType === 'HL7' ? 'text/plain' : 'application/pdf';
        const disposition = action === 'view'
            ? `inline; filename="${filename}"`
            : `attachment; filename="${filename}"`;

        res.set({
            'Content-Type': contentType,
            'Content-Disposition': disposition,
        });
        res.send(Buffer.from(fileBuffer));
    } catch (error) {
        console.error('💥 Download error:', error);
        res.status(500).json({ error: 'Failed to download file', details: error.message });
    }
});
