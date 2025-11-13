import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

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
        const { filename, user_id } = await req.json();
        
        if (!filename || !user_id) {
            return Response.json({ 
                error: 'filename and user_id are required' 
            }, { status: 400, headers: corsHeaders });
        }

        const base44 = createClientFromRequest(req);
        
        // Verify admin access
        const requestingUser = await base44.auth.me();
        if (!requestingUser || requestingUser.role !== 'admin') {
            return Response.json({ 
                error: 'Unauthorized' 
            }, { status: 401, headers: corsHeaders });
        }

        // Get the user
        const user = await base44.asServiceRole.entities.User.get(user_id);
        if (!user) {
            return Response.json({ 
                error: 'User not found' 
            }, { status: 404, headers: corsHeaders });
        }

        // Create lab result record
        const labResult = await base44.asServiceRole.entities.LabResult.create({
            test_name: 'Blood Test Results',
            test_type: 'blood_work',
            test_date: new Date().toISOString().split('T')[0],
            status: 'normal',
            icon_color: 'red',
            blood_result_filename: filename,
            created_by: user.email,
            results_summary: 'Blood test results uploaded. View full report for details.'
        });

        console.log(`✅ Matched blood result ${filename} to user ${user.full_name}`);

        return Response.json({
            success: true,
            message: `Blood result matched to ${user.full_name}`,
            lab_result: labResult
        }, { headers: corsHeaders });

    } catch (error) {
        console.error('❌ Error matching blood result:', error);
        return Response.json({ 
            error: 'Failed to match blood result',
            details: error.message
        }, { status: 500, headers: corsHeaders });
    }
});