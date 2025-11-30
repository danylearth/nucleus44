import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

const SFTP_PROXY_URL = Deno.env.get("SFTP_PROXY_URL");
const SFTP_PROXY_API_KEY = Deno.env.get("SFTP_PROXY_API_KEY");

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS'
};

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user || user.role !== 'admin') {
            return Response.json({ error: 'Unauthorized - Admin only' }, { status: 401, headers: corsHeaders });
        }

        // List files in /files directory
        const filesListUrl = `${SFTP_PROXY_URL}/sftp/list?path=/files`;
        const filesResponse = await fetch(filesListUrl, {
            method: 'GET',
            headers: { 'x-api-key': SFTP_PROXY_API_KEY }
        });

        let filesData = null;
        if (filesResponse.ok) {
            filesData = await filesResponse.json();
        }

        // List files in /files/archive directory
        const archiveListUrl = `${SFTP_PROXY_URL}/sftp/list?path=/files/archive`;
        const archiveResponse = await fetch(archiveListUrl, {
            method: 'GET',
            headers: { 'x-api-key': SFTP_PROXY_API_KEY }
        });

        let archiveData = null;
        if (archiveResponse.ok) {
            archiveData = await archiveResponse.json();
        }

        return Response.json({
            success: true,
            files_directory: filesData,
            archive_directory: archiveData
        }, { headers: corsHeaders });

    } catch (error) {
        console.error('Error listing SFTP files:', error);
        return Response.json({ 
            error: 'Failed to list files',
            details: error.message
        }, { status: 500, headers: corsHeaders });
    }
});