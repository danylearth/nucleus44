import { Router } from 'express';
import { requireAuth } from '../server.js';

export const router = Router();

const SFTP_PROXY_URL = process.env.SFTP_PROXY_URL;
const SFTP_PROXY_API_KEY = process.env.SFTP_PROXY_API_KEY;

router.post('/', requireAuth, async (req, res) => {
    try {
        const { filename } = req.body;

        if (!filename) {
            return res.status(400).json({ error: 'filename is required' });
        }

        // Generate PDF filename from HL7 filename
        const pdfFilename = filename.replace(/\.hl7$/i, '.pdf');
        const paths = [`/files/archive/${pdfFilename}`, `/files/${pdfFilename}`];
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
            throw new Error(`PDF not found for: ${filename}`);
        }

        const fileBuffer = await fileResponse.arrayBuffer();

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `inline; filename="${pdfFilename}"`,
        });
        res.send(Buffer.from(fileBuffer));
    } catch (error) {
        console.error('💥 PDF download error:', error);
        res.status(500).json({ error: 'Failed to download PDF', details: error.message });
    }
});
