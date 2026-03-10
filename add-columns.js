const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://lrsmmfpsbawznjpnllwr.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxyc21tZnBzYmF3em5qcG5sbHdyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mjk2NzcxNywiZXhwIjoyMDY4NTQzNzE3fQ.o-rTq4lGdi1JUfck37mmVr8n4khOe5qmT5CRkB4vgmQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function alterTable() {
    const { data, error } = await supabase.rpc('execute_sql', {
        query: "ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_instagram TEXT; ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_department TEXT;"
    });

    if (error) {
        console.error('Error running RPC:', error.message);
    } else {
        console.log('Success:', data);
    }
}

alterTable();
