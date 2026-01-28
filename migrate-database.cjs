const { Client } = require('pg');
require('dotenv').config();

// Configuración de conexión a PostgreSQL
const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: false // Deshabilitado según tu configuración
});

async function executeSQL() {
    console.log('🔌 Conectando a PostgreSQL...\n');

    try {
        await client.connect();
        console.log('✅ Conexión establecida\n');

        // 1. Verificar estructura actual
        console.log('📊 Verificando estructura actual de la tabla loans...');
        const checkQuery = `
      SELECT column_name, data_type, column_default
      FROM information_schema.columns
      WHERE table_name = 'loans' AND table_schema = 'public'
      ORDER BY ordinal_position;
    `;
        const { rows: columns } = await client.query(checkQuery);

        console.log('✅ Columnas encontradas:');
        columns.forEach(col => {
            console.log(`   - ${col.column_name} (${col.data_type})`);
        });

        // Verificar si interest_type existe
        const hasInterestType = columns.some(col => col.column_name === 'interest_type');

        if (!hasInterestType) {
            console.log('\n⚠️  La columna interest_type NO existe. Creándola...');
            await client.query(`
        ALTER TABLE public.loans 
        ADD COLUMN interest_type TEXT DEFAULT 'simple' 
        CHECK (interest_type IN ('simple', 'compound'));
      `);
            console.log('✅ Columna interest_type creada');
        } else {
            console.log('\n✅ La columna interest_type ya existe');

            // Actualizar el constraint
            console.log('\n🔧 Actualizando constraint de interest_type...');

            // Eliminar constraint antiguo
            await client.query(`
        ALTER TABLE public.loans 
        DROP CONSTRAINT IF EXISTS loans_interest_type_check;
      `);
            console.log('✅ Constraint antiguo eliminado');

            // Crear nuevo constraint
            await client.query(`
        ALTER TABLE public.loans 
        ADD CONSTRAINT loans_interest_type_check 
        CHECK (interest_type IN ('simple', 'compound'));
      `);
            console.log('✅ Nuevo constraint creado');

            // Actualizar valor por defecto
            await client.query(`
        ALTER TABLE public.loans 
        ALTER COLUMN interest_type SET DEFAULT 'simple';
      `);
            console.log('✅ Valor por defecto actualizado');

            // Actualizar valores existentes
            const { rowCount } = await client.query(`
        UPDATE public.loans 
        SET interest_type = CASE 
          WHEN interest_type = 'flat' THEN 'simple'
          WHEN interest_type = 'declining' THEN 'compound'
          ELSE 'simple'
        END
        WHERE interest_type IN ('flat', 'declining');
      `);
            console.log(`✅ ${rowCount} préstamos actualizados`);
        }

        // Verificar que installment_amount existe
        const hasInstallmentAmount = columns.some(col => col.column_name === 'installment_amount');

        if (!hasInstallmentAmount) {
            console.log('\n⚠️  La columna installment_amount NO existe. Creándola...');
            await client.query(`
        ALTER TABLE public.loans 
        ADD COLUMN installment_amount DECIMAL(15,2) NOT NULL DEFAULT 0;
      `);
            console.log('✅ Columna installment_amount creada');
        } else {
            console.log('✅ La columna installment_amount ya existe');
        }

        // Verificar estructura final
        console.log('\n📋 Verificando estructura final...');
        const { rows: finalColumns } = await client.query(checkQuery);

        const requiredColumns = [
            'id', 'user_id', 'client_id', 'loan_number',
            'principal_amount', 'interest_rate', 'interest_type',
            'total_interest', 'total_amount', 'installments',
            'installment_amount', 'frequency', 'start_date', 'end_date',
            'paid_amount', 'paid_installments', 'remaining_amount',
            'status', 'notes', 'created_at', 'updated_at'
        ];

        console.log('\n✅ Verificación de columnas requeridas:');
        requiredColumns.forEach(col => {
            const exists = finalColumns.some(c => c.column_name === col);
            console.log(`   ${exists ? '✅' : '❌'} ${col}`);
        });

        console.log('\n🎉 ¡Migración completada exitosamente!');
        console.log('✅ La base de datos está lista para usar');
        console.log('\n💡 Ahora puedes:');
        console.log('   1. Crear préstamos desde la aplicación');
        console.log('   2. Registrar pagos');
        console.log('   3. Generar Paz y Salvo');

    } catch (error) {
        console.error('\n❌ Error durante la migración:', error.message);
        console.error('Detalles:', error);
    } finally {
        await client.end();
        console.log('\n🔌 Conexión cerrada');
    }
}

executeSQL();
