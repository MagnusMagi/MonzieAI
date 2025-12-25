/**
 * Supabase Table Creator Script
 * Creates scenes table in Supabase using service role key
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://groguatbjerebweinuef.supabase.co';
const SERVICE_ROLE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdyb2d1YXRiamVyZWJ3ZWludWVmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTEwMDY2NSwiZXhwIjoyMDgwNjc2NjY1fQ.AzReOmy0sjsagWar6zv1EKRW3Z41E6Gpd_X_uxz8Y6s';

// Create Supabase client with service role key
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function createScenesTable() {
  console.log('🚀 Creating scenes table in Supabase...\n');

  // SQL script to create table
  const sqlScript = `
    -- Create scenes table
    CREATE TABLE IF NOT EXISTS public.scenes (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      description TEXT,
      category TEXT NOT NULL,
      preview_url TEXT,
      prompt_template TEXT,
      is_active BOOLEAN DEFAULT true NOT NULL,
      created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
      updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
    );

    -- Create indexes
    CREATE INDEX IF NOT EXISTS idx_scenes_category ON public.scenes(category);
    CREATE INDEX IF NOT EXISTS idx_scenes_is_active ON public.scenes(is_active);
    CREATE INDEX IF NOT EXISTS idx_scenes_name ON public.scenes(name);

    -- Enable Row Level Security (RLS)
    ALTER TABLE public.scenes ENABLE ROW LEVEL SECURITY;

    -- Drop existing policy if exists
    DROP POLICY IF EXISTS "Allow anonymous read access to active scenes" ON public.scenes;

    -- Create policy to allow anonymous read access to active scenes
    CREATE POLICY "Allow anonymous read access to active scenes"
      ON public.scenes
      FOR SELECT
      USING (is_active = true);

    -- Create updated_at trigger function
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = now();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    -- Drop existing trigger if exists
    DROP TRIGGER IF EXISTS update_scenes_updated_at ON public.scenes;

    -- Create trigger to auto-update updated_at
    CREATE TRIGGER update_scenes_updated_at
      BEFORE UPDATE ON public.scenes
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  `;

  try {
    // Supabase REST API doesn't support DDL, so we need to use RPC
    // But first, let's check if we can use the REST API to execute SQL
    // Actually, Supabase doesn't expose a direct SQL execution endpoint via REST API

    // Alternative: Use Supabase's REST API to call a stored procedure
    // But we need to create the stored procedure first, which requires SQL execution

    // The only way is to use the Supabase Dashboard SQL Editor or direct PostgreSQL connection

    console.log('❌ Supabase REST API does not support DDL operations (CREATE TABLE).');
    console.log('📝 Please run the SQL script in Supabase Dashboard SQL Editor:\n');
    console.log(sqlScript);
    console.log('\n✅ After running the SQL, the table will be created.');

    // However, we can verify if the table exists
    const { data, error } = await supabase.from('scenes').select('id').limit(1);

    if (error) {
      if (error.code === 'PGRST205') {
        console.log('\n⚠️  Table does not exist yet. Please create it using the SQL above.');
      } else {
        console.log('\n❌ Error checking table:', error.message);
      }
    } else {
      console.log('\n✅ Table already exists!');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the script
createScenesTable();
