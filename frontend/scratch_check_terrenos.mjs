import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://lyeywamxqwwliigimhgj.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5ZXl3YW14cXd3bGlpZ2ltaGdqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODk1ODk1MSwiZXhwIjoyMDk0NTM0OTUxfQ.2zHAQ5rNFyvQYnyNCiIsdS4Vv2qrTBl-YgRHQKGZGco';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function main() {
  const { data: allTerrenos, error } = await supabase.from('terrenos').select('*');
  if (error) {
    console.error(error);
    return;
  }
  console.log('Total fetched:', allTerrenos.length);

  const targets = ['386.83', '346.11', '294.78', '294.05', '293.29', '292.54', '291.77', '290.24'];
  for (const t of allTerrenos) {
    const str = JSON.stringify(t);
    for (const target of targets) {
      if (str.includes(target)) {
        console.log(`MATCH ${target}:`, t);
      }
    }
  }
}

main();
