import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function createTestData() {
    try {
        console.log("🔌 Conectando a DB...");
        const client = await pool.connect();

        // 1. Obtener usuario
        const userRes = await client.query(`SELECT id FROM auth.users LIMIT 1`);
        if (userRes.rows.length === 0) throw new Error("No hay usuarios en auth.users");
        const userId = userRes.rows[0].id;
        console.log(`👤 Usuario ID: ${userId}`);

        // 2. Cliente (3136174267)
        const phone = "573136174267";
        const clientName = "Davey Mena (Test IA)";

        let clientId;
        const existClient = await client.query(`SELECT id FROM clients WHERE phone = $1`, [phone]);

        if (existClient.rows.length > 0) {
            clientId = existClient.rows[0].id;
            console.log(`✅ Cliente existente: ${clientId}`);
        } else {
            const insertClient = await client.query(`
                INSERT INTO clients (user_id, full_name, phone, document_id, address, status, credit_limit, created_at, updated_at)
                VALUES ($1, $2, $3, '123456789', 'Calle Falsa 123', 'active', 1000000, NOW(), NOW())
                RETURNING id;
            `, [userId, clientName, phone]);
            clientId = insertClient.rows[0].id;
            console.log(`✨ Cliente creado: ${clientId}`);
        }

        // 3. Préstamo Vencido
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        const loanRes = await client.query(`
            INSERT INTO loans (
                user_id, client_id, loan_number, 
                principal_amount, total_amount, remaining_amount, paid_amount,
                interest_rate, interest_type, installments, paid_installments, installment_amount,
                frequency, start_date, end_date, status, created_at, updated_at
            ) VALUES (
                $1, $2, 'TEST-IA-001', 
                100000, 120000, 50000, 70000,
                20, 'simple', 12, 1, 10000,
                'monthly', NOW() - INTERVAL '30 days', $3, 'active', NOW(), NOW()
            ) RETURNING id;
        `, [userId, clientId, yesterday]);

        console.log(`💰 Préstamo VENCIDO creado (ID: ${loanRes.rows[0].id})`);

        client.release();
        process.exit(0);

    } catch (e) {
        console.error("❌ Error:", e);
        process.exit(1);
    }
}

createTestData();
