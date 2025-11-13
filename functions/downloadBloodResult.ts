import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

const SFTP_PROXY_URL = Deno.env.get("SFTP_PROXY_URL");
const SFTP_PROXY_API_KEY = Deno.env.get("SFTP_PROXY_API_KEY");

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const body = await req.json();
        console.log('🔍 Received body:', JSON.stringify(body, null, 2));
        
        const { filename, action } = body;
        
        console.log('📄 Filename:', filename);
        console.log('🎬 Action:', action);
        
        if (!filename) {
            return Response.json({ error: 'filename is required' }, { status: 400, headers: corsHeaders });
        }

        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
        }

        const remotePath = `/files/${filename}`;
        console.log('📥 Constructed remote path:', remotePath);
        console.log('🔌 Using SFTP proxy:', SFTP_PROXY_URL);

        // Call the proxy service to download file
        const proxyUrl = `${SFTP_PROXY_URL}/sftp/get?path=${encodeURIComponent(remotePath)}`;
        console.log('🌐 Full proxy URL:', proxyUrl);
        console.log('🔐 Using API key:', SFTP_PROXY_API_KEY ? 'SET ✓' : 'NOT SET ✗');
        
        const proxyResponse = await fetch(proxyUrl, {
            method: 'GET',
            headers: {
                'x-api-key': SFTP_PROXY_API_KEY
            }
        });

        console.log('📡 Proxy response status:', proxyResponse.status);

        if (!proxyResponse.ok) {
            const contentType = proxyResponse.headers.get('content-type');
            let errorText;
            
            if (contentType && contentType.includes('application/json')) {
                const errorJson = await proxyResponse.json();
                errorText = JSON.stringify(errorJson, null, 2);
                console.error('❌ Proxy JSON error:', errorJson);
            } else {
                errorText = await proxyResponse.text();
                console.error('❌ Proxy text error:', errorText);
            }
            
            throw new Error(`Proxy returned ${proxyResponse.status}: ${errorText}`);
        }

        // Get the file as array buffer
        const fileBuffer = await proxyResponse.arrayBuffer();
        console.log('✅ File downloaded successfully, size:', fileBuffer.byteLength);

        // Determine file type and content type
        const fileType = filename.split('.').pop().toUpperCase();
        const contentType = fileType === 'HL7' ? 'text/plain' : 'application/pdf';
        
        // Determine content disposition based on action
        const disposition = action === 'view' 
            ? `inline; filename="${filename}"`
            : `attachment; filename="${filename}"`;

        // Return file as response
        return new Response(fileBuffer, {
            status: 200,
            headers: {
                ...corsHeaders,
                'Content-Type': contentType,
                'Content-Disposition': disposition
            }
        });

    } catch (error) {
        console.error('💥 Download error:', error);
        return Response.json({ 
            error: 'Failed to download file',
            details: error.message,
            stack: error.stack
        }, { status: 500, headers: corsHeaders });
    }
});