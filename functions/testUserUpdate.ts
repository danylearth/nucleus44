import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        console.log('🔍 Current user data:', {
            id: user.id,
            email: user.email,
            full_name: user.full_name,
            date_of_birth: user.date_of_birth,
            phone_number: user.phone_number,
            profile_picture: user.profile_picture
        });

        // Test 1: Try to update full name
        console.log('📝 Test 1: Updating full_name...');
        const testName = `Test User ${Date.now()}`;
        await base44.auth.updateMe({ full_name: testName });
        
        const afterNameUpdate = await base44.auth.me();
        console.log('✅ After name update:', afterNameUpdate.full_name);

        // Test 2: Try to update date of birth
        console.log('📝 Test 2: Updating date_of_birth...');
        const testDob = '1995-06-15';
        await base44.auth.updateMe({ date_of_birth: testDob });
        
        const afterDobUpdate = await base44.auth.me();
        console.log('✅ After DOB update:', afterDobUpdate.date_of_birth);

        // Test 3: Try to update phone number
        console.log('📝 Test 3: Updating phone_number...');
        const testPhone = '+44 7700 900123';
        await base44.auth.updateMe({ phone_number: testPhone });
        
        const afterPhoneUpdate = await base44.auth.me();
        console.log('✅ After phone update:', afterPhoneUpdate.phone_number);

        // Restore original values
        console.log('🔄 Restoring original values...');
        await base44.auth.updateMe({
            full_name: user.full_name,
            date_of_birth: user.date_of_birth,
            phone_number: user.phone_number
        });

        return Response.json({
            success: true,
            tests: {
                nameUpdate: afterNameUpdate.full_name === testName,
                dobUpdate: afterDobUpdate.date_of_birth === testDob,
                phoneUpdate: afterPhoneUpdate.phone_number === testPhone
            },
            results: {
                originalUser: user,
                afterNameUpdate: afterNameUpdate.full_name,
                afterDobUpdate: afterDobUpdate.date_of_birth,
                afterPhoneUpdate: afterPhoneUpdate.phone_number
            }
        });
    } catch (error) {
        console.error('❌ Test failed:', error);
        return Response.json({ 
            error: error.message,
            stack: error.stack
        }, { status: 500 });
    }
});