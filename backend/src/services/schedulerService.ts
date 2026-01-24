import cron from 'node-cron';
import { Pool } from 'pg';
import dotenv from 'dotenv';
import { WhatsAppService } from './whatsappService';
import { AIService } from './aiService';

dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

export class SchedulerService {
    private waService: WhatsAppService;
    private aiService: AIService;

    constructor() {
        this.waService = WhatsAppService.getInstance();
        this.aiService = AIService.getInstance();
    }

    start() {
        // Ejecutar todos los días a las 8:00 AM
        cron.schedule('0 8 * * *', async () => {
            console.log('⏳ Ejecutando revisión diaria de cobros...');
            await this.checkDueLoans();
        });

        console.log('✅ Scheduler iniciado: Revisión diaria a las 8:00 AM');
    }

    async checkDueLoans() {
        if (!this.waService.isConnected()) {
            console.log('⚠️ WhatsApp no está conectado. Omitiendo recordatorios.');
            return;
        }

        try {
            // Obtener préstamos activos que vecen hoy o están vencidos
            // NOTA: Ajustar nombres de tablas según tu esquema de Supabase/Postgres
            const query = `
                SELECT 
                    l.id, 
                    l.remaining_amount, 
                    l.end_date,
                    c.full_name as client_name, 
                    c.phone
                FROM loans l
                JOIN clients c ON l.client_id = c.id
                WHERE l.status = 'active'
                  AND l.remaining_amount > 0
                  AND (l.end_date <= CURRENT_DATE)
            `;

            const { rows } = await pool.query(query);
            console.log(`📊 Se encontraron ${rows.length} préstamos para gestionar.`);

            for (const loan of rows) {
                const dueDate = new Date(loan.end_date);
                const today = new Date();
                const diffTime = Math.abs(today.getTime() - dueDate.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                const isOverdue = dueDate < today;

                // Generar mensaje con IA
                const message = await this.aiService.generateReminderMessage({
                    clientName: loan.client_name,
                    amount: parseFloat(loan.remaining_amount),
                    dueDate: dueDate.toLocaleDateString(),
                    daysOverdue: isOverdue ? diffDays : undefined
                });

                // Enviar mensaje con delay aleatorio (Anti-Baneo)
                await this.waService.sendReminder(loan.phone, message);

                // Esperar entre 2 y 5 minutos entre clientes para seguridad de la cuenta
                await this.waService.randomDelay(120000, 300000);
            }

        } catch (error) {
            console.error('Error en revisión diaria:', error);
        }
    }
}
