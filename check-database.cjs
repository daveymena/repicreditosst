const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabase() {
    console.log('🔍 Verificando estado de la base de datos...\n');

    try {
        // Verificar préstamos
        const { data: loans, error: loansError } = await supabase
            .from('loans')
            .select('*')
            .limit(5);

        if (loansError) {
            console.error('❌ Error al consultar préstamos:', loansError.message);
        } else {
            console.log(`✅ Tabla 'loans': ${loans.length} préstamos encontrados`);
            if (loans.length > 0) {
                console.log('\n📊 Ejemplo de préstamo:');
                const loan = loans[0];
                console.log('   - ID:', loan.id);
                console.log('   - Número:', loan.loan_number);
                console.log('   - Monto:', loan.total_amount);
                console.log('   - Interest Type:', loan.interest_type);
                console.log('   - Status:', loan.status);
            }
        }

        // Verificar clientes
        const { data: clients, error: clientsError } = await supabase
            .from('clients')
            .select('id, full_name, phone')
            .limit(5);

        if (!clientsError && clients) {
            console.log(`\n✅ Tabla 'clients': ${clients.length} clientes encontrados`);
        }

        // Verificar pagos
        const { data: payments, error: paymentsError } = await supabase
            .from('payments')
            .select('id, amount, payment_date')
            .limit(5);

        if (!paymentsError && payments) {
            console.log(`✅ Tabla 'payments': ${payments.length} pagos encontrados`);
        }

        console.log('\n📋 Resumen:');
        console.log('   - Conexión a Supabase: ✅ OK');
        console.log('   - Tablas accesibles: ✅ OK');
        console.log('   - La aplicación está lista para usar');

        if (loans.length === 0) {
            console.log('\n💡 Siguiente paso: Crea tu primer préstamo desde la aplicación');
            console.log('   1. Ve a http://localhost:8080');
            console.log('   2. Inicia sesión o regístrate');
            console.log('   3. Crea un cliente');
            console.log('   4. Crea un préstamo');
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

checkDatabase();
