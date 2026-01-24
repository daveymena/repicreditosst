import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { WhatsAppService } from './services/whatsappService';
import { SchedulerService } from './services/schedulerService';
import { AIService } from './services/aiService';
import paymentRoutes from './routes/payments';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Rutas de Pago
app.use('/api/payments', paymentRoutes);

// Iniciar Servicios
const waService = WhatsAppService.getInstance();
const scheduler = new SchedulerService();

// Estado local
let currentQR = '';
let connectionStatus = 'disconnected';

waService.setQRCallback((qr) => {
    currentQR = qr;
    connectionStatus = 'qr_ready';
});

waService.setStatusCallback((status) => {
    connectionStatus = status;
    if (status === 'connected') currentQR = '';
});

scheduler.start();

// Rutas API
app.get('/api/whatsapp/status', (req, res) => {
    res.json({ status: connectionStatus, qr: currentQR });
});

app.post('/api/whatsapp/disconnect', async (req, res) => {
    // Lógica futura de desconexión
    res.json({ message: 'OK' });
});

app.post('/api/test-message', async (req, res) => {
    // ... (existente)
    const phone = req.body.phone || req.query.phone;
    const message = req.body.message || req.query.message;

    console.log('Test Request:', { body: req.body, query: req.query });

    if (!phone) return res.status(400).json({ error: 'Falta el teléfono' });

    try {
        const sent = await waService.sendReminder(phone, message || "Hola! Este es un mensaje de prueba de RapiCréditos. 🚀");
        if (sent) res.json({ success: true, message: 'Mensaje enviado a cola' });
        else res.status(500).json({ error: 'No se pudo enviar. Verifica que WhatsApp esté conectado.' });
    } catch (e) {
        res.status(500).json({ error: String(e) });
    }
});

// Endpoint para probar FLUJO COMPLETO (Simulando DB)
app.post('/api/test-ai-flow', async (req, res) => {
    const { phone } = req.body;
    // Fallback query para pruebas fáciles
    const targetPhone = phone || req.query.phone;

    if (!targetPhone) return res.status(400).json({ error: 'Falta teléfono' });

    try {
        console.log(`🤖 Iniciando prueba de IA para ${targetPhone}...`);

        // 1. Datos Simulados del Préstamo
        const mockLoan = {
            clientName: "Davey Mena",
            amount: 50000,
            dueDate: new Date(Date.now() - 86400000).toLocaleDateString(), // Ayer
            daysOverdue: 1
        };

        // 2. Generar mensaje con IA (Ollama)
        const ai = AIService.getInstance();

        console.log("🧠 Solicitando mensaje a Ollama...");
        const message = await ai.generateReminderMessage(mockLoan);
        console.log("📝 Mensaje generado:", message);

        // 3. Enviar por WhatsApp
        console.log("📨 Enviando por WhatsApp...");
        const sent = await waService.sendReminder(String(targetPhone), message);

        if (sent) {
            res.json({ success: true, message, note: "Mensaje generado por IA y enviado a WhatsApp" });
        } else {
            res.status(500).json({ error: "Fallo al enviar a WhatsApp (¿Está conectado?)" });
        }

    } catch (e) {
        console.error(e);
        res.status(500).json({ error: String(e) });
    }
});

app.post('/api/scheduler/run-now', async (req, res) => {
    try {
        await scheduler.checkDueLoans();
        res.json({ message: 'Run OK' });
    } catch (e) {
        res.status(500).json({ error: String(e) });
    }
});

// SERVIR FRONTEND EN PRODUCCIÓN
// Easypanel montará el build del frontend en /app/public o similar
// Asumimos que al construir, copiamos el frontend dist a backend/public
const publicPath = path.join(__dirname, '../public');
app.use(express.static(publicPath));

// Cualquier ruta no API redirige al index.html (SPA)
// Express 5 requiere Regex para match-all
app.get(/.*/, (req, res) => {
    res.sendFile(path.join(publicPath, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 RapiCréditos Server en puerto ${PORT}`);
    console.log(`📂 Sirviendo frontend desde: ${publicPath}`);
});
