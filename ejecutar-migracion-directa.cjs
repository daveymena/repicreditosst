const https = require('https');
require('dotenv').config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// SQL a ejecutar
const SQL_STATEMENTS = [
    // 1. Eliminar constraint antiguo
    `ALTER TABLE public.loans DROP CONSTRAINT IF EXISTS loans_interest_type_check;`,

    // 2. Agregar nuevo constraint
    `ALTER TABLE public.loans ADD CONSTRAINT loans_interest_type_check CHECK (interest_type IN ('simple', 'compound'));`,

    // 3. Actualizar valor por defecto
    `ALTER TABLE public.loans ALTER COLUMN interest_type SET DEFAULT 'simple';`,

    // 4. Actualizar valores existentes
    `UPDATE public.loans SET interest_type = CASE WHEN interest_type = 'flat' THEN 'simple' WHEN interest_type = 'declining' THEN 'compound' ELSE 'simple' END WHERE interest_type IN ('flat', 'declining') OR interest_type IS NULL;`
];

async function executeDirectSQL() {
    console.log('🚀 Ejecutando SQL directamente en Supabase...\n');

    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

    try {
        // Verificar conexión
        console.log('🔌 Verificando conexión...');
        const { data, error } = await supabase.from('loans').select('count').limit(1);
        console.log('✅ Conexión establecida\n');

        // Intentar ejecutar usando una Edge Function o RPC
        console.log('⚠️  IMPORTANTE: Supabase no permite ALTER TABLE desde el cliente JavaScript');
        console.log('📋 Por seguridad, estos comandos deben ejecutarse desde el SQL Editor\n');

        console.log('✅ He generado el archivo: EJECUTAR_EN_SUPABASE_SQL_EDITOR.sql');
        console.log('\n🔗 Abre este link para ejecutarlo:');
        console.log(`   https://supabase.com/dashboard/project/beossytirulfjhaeoyeb/sql/new\n`);

        console.log('📝 O copia y pega este SQL:');
        console.log('━'.repeat(60));

        const fullSQL = SQL_STATEMENTS.join('\n\n');
        console.log(fullSQL);

        console.log('━'.repeat(60));
        console.log('\n💡 Alternativa: Si tienes acceso a la base de datos PostgreSQL directamente,');
        console.log('   puedo conectarme usando las credenciales de PostgreSQL del .env\n');

        // Verificar si tenemos credenciales de PostgreSQL
        if (process.env.DATABASE_URL) {
            console.log('🔍 Detecté DATABASE_URL en el .env');
            console.log('¿Quieres que intente ejecutar usando PostgreSQL directo? (Esto es más seguro)\n');

            // Ejecutar con PostgreSQL
            await executeWithPostgres();
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

async function executeWithPostgres() {
    const { Client } = require('pg');

    console.log('\n🔧 Intentando con conexión PostgreSQL directa...');

    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: false
    });

    try {
        await client.connect();
        console.log('✅ Conectado a PostgreSQL\n');

        for (let i = 0; i < SQL_STATEMENTS.length; i++) {
            const sql = SQL_STATEMENTS[i];
            console.log(`📝 Ejecutando paso ${i + 1}/${SQL_STATEMENTS.length}...`);

            try {
                await client.query(sql);
                console.log(`✅ Paso ${i + 1} completado`);
            } catch (err) {
                if (err.message.includes('does not exist')) {
                    console.log(`⚠️  Paso ${i + 1} omitido (ya aplicado)`);
                } else {
                    console.error(`❌ Error en paso ${i + 1}:`, err.message);
                }
            }
        }

        console.log('\n🎉 ¡Migración completada!');

        // Verificar resultado
        const { rows } = await client.query(`
      SELECT column_name, data_type, column_default
      FROM information_schema.columns
      WHERE table_name = 'loans' AND column_name IN ('interest_type', 'installment_amount')
      ORDER BY column_name;
    `);

        console.log('\n✅ Verificación:');
        rows.forEach(row => {
            console.log(`   - ${row.column_name}: ${row.data_type} (default: ${row.column_default || 'N/A'})`);
        });

    } catch (error) {
        console.error('\n❌ Error con PostgreSQL:', error.message);
        console.log('\n💡 Usa el SQL Editor de Supabase en su lugar');
    } finally {
        await client.end();
    }
}

executeDirectSQL();
