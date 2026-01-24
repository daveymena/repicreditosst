"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../.env') });
const pool = new pg_1.Pool({ connectionString: process.env.DATABASE_URL });
function createTestData() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log("🔌 Conectando a DB...");
            const client = yield pool.connect();
            // 1. Obtener usuario
            const userRes = yield client.query(`SELECT id FROM auth.users LIMIT 1`);
            if (userRes.rows.length === 0)
                throw new Error("No hay usuarios en auth.users");
            const userId = userRes.rows[0].id;
            console.log(`👤 Usuario ID: ${userId}`);
            // 2. Cliente (3136174267)
            const phone = "573136174267";
            const clientName = "Davey Mena (Test IA)";
            let clientId;
            const existClient = yield client.query(`SELECT id FROM clients WHERE phone = $1`, [phone]);
            if (existClient.rows.length > 0) {
                clientId = existClient.rows[0].id;
                console.log(`✅ Cliente existente: ${clientId}`);
            }
            else {
                const insertClient = yield client.query(`
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
            const loanRes = yield client.query(`
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
        }
        catch (e) {
            console.error("❌ Error:", e);
            process.exit(1);
        }
    });
}
createTestData();
