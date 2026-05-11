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
        const base44 = createClientFromRequest(req);
        
        // Use service role to access the database
        const allUsers = await base44.asServiceRole.entities.AppUser.list();
        console.log(`Found ${allUsers.length} users to delete`);

        let deletedCount = 0;
        
        // Delete each user using service role
        for (const user of allUsers) {
            try {
                await base44.asServiceRole.entities.AppUser.delete(user.id);
                deletedCount++;
                console.log(`Deleted user: ${user.email} (ID: ${user.id})`);
            } catch (deleteError) {
                console.error(`Failed to delete user ${user.id}:`, deleteError.message);
            }
        }

        return Response.json({
            message: "Cleanup completed",
            totalUsersFound: allUsers.length,
            totalUsersDeleted: deletedCount
        }, { headers: corsHeaders });

    } catch (error) {
        console.error('Cleanup error:', error);
        return Response.json({
            error: 'Cleanup failed',
            details: error.message
        }, { status: 500, headers: corsHeaders });
    }
});