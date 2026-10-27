import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const SUPABASE_URL = 'https://lyeywamxqwwliigimhgj.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5ZXl3YW14cXd3bGlpZ2ltaGdqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODk1ODk1MSwiZXhwIjoyMDk0NTM0OTUxfQ.2zHAQ5rNFyvQYnyNCiIsdS4Vv2qrTBl-YgRHQKGZGco';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function main() {
  const { data: allTerrenos, error } = await supabase
    .from('terrenos')
    .select('id, clave, superficie_m2, precio_lista, propietario, estado, parcela_id')
    .order('created_at', { ascending: true });
    
  if (error) {
    console.error(error);
    return;
  }
  
  const lines = allTerrenos.map((t, i) => `${i+1}. [${t.clave}] | Sup: ${t.superficie_m2} | Precio: ${t.precio_lista} | Prop: '${t.propietario}' | Estado: ${t.estado}`);
  fs.writeFileSync('all_terrenos.txt', lines.join('\n'), 'utf8');
  console.log(`Saved ${allTerrenos.length} terrenos to all_terrenos.txt`);
}

main();
