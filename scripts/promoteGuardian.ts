#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

(async () => {
    // Check if environment variables are set
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
        console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_KEY environment variables must be set');
        process.exit(1);
    }

    const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!);
    const userId = process.argv[2];
    if (!userId) {
        console.error('Pass user id as argument');
        console.log('Usage: npm run promote:guardian <user-id>');
        process.exit(1);
    }

    const { error } = await supabase.from('profiles').update({ role: 'guardian' }).eq('id', userId);
    if (error) {
        console.error('Error promoting user to guardian:', error);
        process.exit(1);
    }

    console.log('Promoted to guardian:', userId);
})();