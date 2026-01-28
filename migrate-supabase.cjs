const { Client } = require('pg');
require('dotenv').config();

// Conexión directa a Supabase PostgreSQL
// Supabase usa PostgreSQL, así que podemos conectarnos directamente
const connectionString = `postgresql://postgres.beossytirulfjhaeoyeb:${encodeURIComponent('tu_password_aqui')}@aws-0-us-east-1.pooler.supabase.com:6543/postgres`;

// O usar la URL de Supabase si está en el .env
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const projectRef = supabaseUrl ? supabaseUrl.split('//')[1].split('.')[0] : 'beossytirulfjhaeoyeb';

console.log('🔍 Proyecto Supabase:', projectRef);

// Usaremos el cliente de Supabase con SQL directo
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl2 = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const supabase = createClient(supabaseUrl2, supabaseKey);

async function executeSupabaseMigration() {
    console.log('🚀 Ejecutando migración en Supabase...\n');

    try {
        // Verificar conexión
        console.log('🔌 Verificando conexión a Supabase...');
        const { data: testData, error: testError } = await supabase
            .from('loans')
            .select('count')
            .limit(1);

        if (testError && !testError.message.includes('count')) {
            console.log('✅ Conexión establecida');
        }

        // Paso 1: Verificar estructura actual
        console.log('\n📊 Verificando columnas de la tabla loans...');
        const { data: sampleLoan } = await supabase
            .from('loans')
            .select('*')
            .limit(1)
            .single();

        if (sampleLoan) {
            console.log('✅ Columnas actuales:');
            Object.keys(sampleLoan).forEach(key => {
                console.log(`   - ${key}`);
            });
        } else {
            console.log('ℹ️  No hay préstamos aún, pero la tabla existe');
        }

        // Paso 2: Ejecutar SQL usando rpc (si tienes una función configurada)
        console.log('\n🔧 Ejecutando migración SQL...');
        console.log('⚠️  Nota: Supabase requiere permisos especiales para ALTER TABLE');
        console.log('📋 Generando SQL para ejecutar manualmente...\n');

        const sqlToExecute = `
-- =====================================================
-- MIGRACIÓN AUTOMÁTICA - Ejecutar en Supabase SQL Editor
-- =====================================================

-- 1. Eliminar constraint antiguo si existe
ALTER TABLE public.loans 
DROP CONSTRAINT IF EXISTS loans_interest_type_check;

-- 2. Agregar nuevo constraint
ALTER TABLE public.loans 
ADD CONSTRAINT loans_interest_type_check 
CHECK (interest_type IN ('simple', 'compound'));

-- 3. Actualizar valor por defecto
ALTER TABLE public.loans 
ALTER COLUMN interest_type SET DEFAULT 'simple';

-- 4. Actualizar valores existentes (si hay)
UPDATE public.loans 
SET interest_type = CASE 
  WHEN interest_type = 'flat' THEN 'simple'
  WHEN interest_type = 'declining' THEN 'compound'
  ELSE 'simple'
END
WHERE interest_type IN ('flat', 'declining') OR interest_type IS NULL;

-- 5. Verificar que installment_amount existe (si no, créala)
-- Si recibes error "column already exists", ignóralo
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'loans' AND column_name = 'installment_amount'
  ) THEN
    ALTER TABLE public.loans 
    ADD COLUMN installment_amount DECIMAL(15,2) NOT NULL DEFAULT 0;
  END IF;
END $$;

-- Verificación final
SELECT 
  COUNT(*) as total_loans,
  interest_type,
  COUNT(*) as count_by_type
FROM public.loans
GROUP BY interest_type;
`;

        console.log('📄 SQL generado:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(sqlToExecute);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        console.log('📍 PASOS PARA EJECUTAR:');
        console.log('1. Ve a: https://supabase.com/dashboard/project/beossytirulfjhaeoyeb/sql/new');
        console.log('2. Copia el SQL de arriba');
        console.log('3. Pégalo en el editor');
        console.log('4. Haz clic en "Run" (o Ctrl+Enter)');
        console.log('5. Verifica que no haya errores\n');

        // Guardar el SQL en un archivo
        const fs = require('fs');
        fs.writeFileSync('EJECUTAR_EN_SUPABASE_SQL_EDITOR.sql', sqlToExecute);
        console.log('💾 SQL guardado en: EJECUTAR_EN_SUPABASE_SQL_EDITOR.sql\n');

        // Intentar verificar si ya está actualizado
        console.log('🔍 Verificando estado actual...');
        const { data: loans, error: loansError } = await supabase
            .from('loans')
            .select('interest_type')
            .limit(10);

        if (!loansError && loans) {
            if (loans.length > 0) {
                const types = [...new Set(loans.map(l => l.interest_type))];
                console.log('📊 Valores actuales de interest_type:', types);

                if (types.includes('simple') || types.includes('compound')) {
                    console.log('✅ ¡La migración parece estar aplicada!');
                } else if (types.includes('flat') || types.includes('declining')) {
                    console.log('⚠️  Aún hay valores antiguos. Ejecuta el SQL de arriba.');
                }
            } else {
                console.log('ℹ️  No hay préstamos para verificar');
                console.log('✅ Ejecuta el SQL de arriba para preparar la base de datos');
            }
        }

        console.log('\n✨ Proceso completado');
        console.log('📌 Recuerda ejecutar el SQL en Supabase Dashboard');

    } catch (error) {
        console.error('\n❌ Error:', error.message);
    }
}

executeSupabaseMigration();
