const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Error: Supabase credentials not found in .env file');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
    console.log('🚀 Iniciando migración de interest_type...\n');

    try {
        // Paso 1: Actualizar valores existentes
        console.log('📝 Paso 1: Actualizando valores existentes de interest_type...');
        const { error: updateError } = await supabase.rpc('exec_sql', {
            sql: `
        UPDATE public.loans 
        SET interest_type = CASE 
          WHEN interest_type = 'flat' THEN 'simple'
          WHEN interest_type = 'declining' THEN 'compound'
          ELSE 'simple'
        END;
      `
        });

        if (updateError) {
            console.log('⚠️  No se pudo actualizar con RPC, intentando método alternativo...');
            console.log('ℹ️  Esto es normal si no tienes la función exec_sql configurada.');
            console.log('\n📋 Por favor, ejecuta este SQL manualmente en Supabase Dashboard:\n');
            console.log('----------------------------------------');
            console.log(`
-- 1. Actualizar valores existentes
UPDATE public.loans 
SET interest_type = CASE 
  WHEN interest_type = 'flat' THEN 'simple'
  WHEN interest_type = 'declining' THEN 'compound'
  ELSE 'simple'
END;

-- 2. Eliminar constraint antiguo
ALTER TABLE public.loans 
DROP CONSTRAINT IF EXISTS loans_interest_type_check;

-- 3. Agregar nuevo constraint
ALTER TABLE public.loans 
ADD CONSTRAINT loans_interest_type_check 
CHECK (interest_type IN ('simple', 'compound'));

-- 4. Actualizar valor por defecto
ALTER TABLE public.loans 
ALTER COLUMN interest_type SET DEFAULT 'simple';
      `);
            console.log('----------------------------------------\n');
            console.log('📍 Pasos para ejecutar manualmente:');
            console.log('1. Ve a https://supabase.com/dashboard');
            console.log('2. Selecciona tu proyecto');
            console.log('3. Ve a "SQL Editor"');
            console.log('4. Copia y pega el SQL de arriba');
            console.log('5. Haz clic en "Run"\n');

            // Verificar si ya está actualizado
            console.log('🔍 Verificando estado actual de la base de datos...');
            const { data: loans, error: selectError } = await supabase
                .from('loans')
                .select('interest_type')
                .limit(5);

            if (!selectError && loans) {
                console.log(`✅ Encontrados ${loans.length} préstamos en la base de datos`);
                if (loans.length > 0) {
                    console.log('📊 Valores actuales de interest_type:');
                    const types = [...new Set(loans.map(l => l.interest_type))];
                    types.forEach(type => {
                        console.log(`   - ${type || '(null)'}`);
                    });

                    if (types.includes('simple') || types.includes('compound')) {
                        console.log('\n✅ ¡Parece que la migración ya fue aplicada!');
                    } else {
                        console.log('\n⚠️  La migración aún no ha sido aplicada.');
                    }
                }
            }
        } else {
            console.log('✅ Valores actualizados correctamente');
            console.log('✅ Migración completada exitosamente!');
        }

    } catch (error) {
        console.error('❌ Error durante la migración:', error.message);
        console.log('\n💡 Solución: Ejecuta el SQL manualmente en Supabase Dashboard (ver instrucciones arriba)');
    }
}

runMigration();
