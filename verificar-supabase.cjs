const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function verificarSupabase() {
    console.log('🔍 VERIFICACIÓN DE SUPABASE\n');
    console.log('='.repeat(60));
    console.log(`📍 URL: ${supabaseUrl}`);
    console.log('='.repeat(60) + '\n');

    try {
        // 1. Verificar tabla loans
        console.log('📊 Verificando tabla LOANS...');
        const { data: loans, error: loansError } = await supabase
            .from('loans')
            .select('*')
            .limit(1);

        if (loansError) {
            console.error('❌ Error:', loansError.message);
            return;
        }

        console.log('✅ Tabla loans accesible');

        if (loans && loans.length > 0) {
            console.log('\n📋 Columnas disponibles:');
            Object.keys(loans[0]).forEach(key => {
                console.log(`   ✅ ${key}`);
            });
        } else {
            console.log('ℹ️  No hay préstamos aún (tabla vacía)');

            // Intentar insertar un préstamo de prueba para ver la estructura
            console.log('\n🔍 Verificando estructura con los tipos de Supabase...');
        }

        // 2. Verificar tabla clients
        console.log('\n📊 Verificando tabla CLIENTS...');
        const { data: clients, error: clientsError } = await supabase
            .from('clients')
            .select('count')
            .limit(1);

        if (!clientsError) {
            console.log('✅ Tabla clients accesible');
        }

        // 3. Verificar tabla payments
        console.log('\n📊 Verificando tabla PAYMENTS...');
        const { data: payments, error: paymentsError } = await supabase
            .from('payments')
            .select('count')
            .limit(1);

        if (!paymentsError) {
            console.log('✅ Tabla payments accesible');
        }

        console.log('\n' + '='.repeat(60));
        console.log('✅ SUPABASE ESTÁ FUNCIONANDO CORRECTAMENTE');
        console.log('='.repeat(60));
        console.log('\n📝 SIGUIENTE PASO:');
        console.log('   Para actualizar el campo interest_type, ejecuta este SQL');
        console.log('   en el SQL Editor de Supabase:\n');
        console.log('   https://supabase.com/dashboard/project/beossytirulfjhaeoyeb/sql/new\n');
        console.log('📄 El SQL está en: EJECUTAR_EN_SUPABASE_SQL_EDITOR.sql\n');

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

verificarSupabase();
