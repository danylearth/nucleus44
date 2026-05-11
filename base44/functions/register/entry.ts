import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

// This function creates a user directly in the User entity using service role
Deno.serve(async (req) => {
    try {
        const { email, password, fullName } = await req.json();

        if (!email || !password || !fullName) {
            return Response.json({ error: 'Email, password, and full name are required' }, { status: 400 });
        }

        const base44 = createClientFromRequest(req);
        
        // Create user directly in the User entity using service role
        const newUser = await base44.asServiceRole.entities.User.create({
            email: email,
            full_name: fullName,
            role: 'user',
            health_score: 750, // Default health score
            age: 25, // Default age
            gender: 'other', // Default gender
            height_cm: 170, // Default height
            weight_kg: 70, // Default weight
            activity_level: 'moderately_active', // Default activity level
            health_goals: ['improve_fitness', 'better_sleep'], // Default goals
            last_login: new Date().toISOString()
        });

        // Note: We can't store the password in the User entity for security reasons
        // The actual password authentication needs to be handled by the platform
        
        return Response.json({
            success: true,
            user: newUser,
            message: 'User created successfully. Please use platform login for authentication.'
        }, { status: 200 });

    } catch (e) {
        console.error('Server error during registration:', e);
        return Response.json({ 
            error: 'Registration failed',
            details: e.message 
        }, { status: 500 });
    }
});