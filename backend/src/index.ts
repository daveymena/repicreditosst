import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { WhatsAppService } from './services/whatsappService';
import { SchedulerService } from './services/schedulerService';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

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
