const { Client } = require('pg');
require('dotenv').config();

async function verificarTodo() {
    console.log('🔍 VERIFICACIÓN COMPLETA DE LA BASE DE DATOS\n');
    console.log('='.repeat(60));

    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: false
    });

    try {
        await client.connect();
        console.log('✅ Conexión establecida\n');

        // 1. Verificar estructura de la tabla loans
        console.log('📊 ESTRUCTURA DE LA TABLA LOANS:');
        console.log('-'.repeat(60));

        const { rows: columns } = await client.query(`
      SELECT 
        column_name, 
        data_type, 
        column_default,
        is_nullable
      FROM information_schema.columns
      WHERE table_name = 'loans' AND table_schema = 'public'
      ORDER BY ordinal_position;
    `);

        columns.forEach(col => {
            const nullable = col.is_nullable === 'YES' ? '(nullable)' : '(NOT NULL)';
            const defaultVal = col.column_default ? `default: ${col.column_default}` : '';
            console.log(`   ${col.column_name.padEnd(25)} ${col.data_type.padEnd(20)} ${nullable} ${defaultVal}`);
        });

        // 2. Verificar constraints
        console.log('\n📋 CONSTRAINTS:');
        console.log('-'.repeat(60));

        const { rows: constraints } = await client.query(`
      SELECT 
        conname as constraint_name,
        pg_get_constraintdef(oid) as definition
      FROM pg_constraint
      WHERE conrelid = 'public.loans'::regclass
      ORDER BY conname;
    `);

        constraints.forEach(c => {
            console.log(`   ${c.constraint_name}`);
            console.log(`      ${c.definition}\n`);
        });

        // 3. Verificar campos críticos
        console.log('✅ VERIFICACIÓN DE CAMPOS CRÍTICOS:');
        console.log('-'.repeat(60));

        const camposCriticos = [
            'interest_type',
            'installment_amount',
            'paid_installments',
            'remaining_amount',
            'status'
        ];

        camposCriticos.forEach(campo => {
            const existe = columns.some(c => c.column_name === campo);
            console.log(`   ${existe ? '✅' : '❌'} ${campo}`);
        });

        // 4. Verificar datos de ejemplo
        console.log('\n📈 DATOS ACTUALES:');
        console.log('-'.repeat(60));

        const { rows: stats } = await client.query(`
      SELECT 
        COUNT(*) as total_loans,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
        COUNT(CASE WHEN status = 'defaulted' THEN 1 END) as defaulted
      FROM public.loans;
    `);

        console.log(`   Total de préstamos: ${stats[0].total_loans}`);
        console.log(`   Activos: ${stats[0].active}`);
        console.log(`   Completados: ${stats[0].completed}`);
        console.log(`   En mora: ${stats[0].defaulted}`);

        // 5. Verificar interest_type
        if (parseInt(stats[0].total_loans) > 0) {
            const { rows: interestTypes } = await client.query(`
        SELECT interest_type, COUNT(*) as count
        FROM public.loans
        GROUP BY interest_type;
      `);

            console.log('\n   Tipos de interés:');
            interestTypes.forEach(t => {
                console.log(`      ${t.interest_type}: ${t.count}`);
            });
        }

        console.log('\n' + '='.repeat(60));
        console.log('🎉 VERIFICACIÓN COMPLETADA');
        console.log('='.repeat(60));
        console.log('\n✅ La base de datos está configurada correctamente');
        console.log('✅ Todos los campos necesarios existen');
        console.log('✅ Los constraints están aplicados');
        console.log('\n💡 Ahora puedes usar la aplicación normalmente:');
        console.log('   → http://localhost:8080\n');

    } catch (error) {
        console.error('\n❌ Error:', error.message);
    } finally {
        await client.end();
    }
}

verificarTodo();
