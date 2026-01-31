import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { WhatsAppService } from './services/whatsappService';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const activeSessions: { [key: string]: WhatsAppService } = {};

async function monitorSessions() {
    console.log('[System] Monitoreando sesiones en Supabase...');

    // Iniciar sesiones que estaban conectadas o son nuevas
    const { data: sessions, error } = await supabase
        .from('whatsapp_sessions')
        .select('*');

    if (error) {
        console.error('[System] Error cargando sesiones:', error);
        return;
    }

    for (const session of sessions) {
        if (!activeSessions[session.id]) {
            const wa = new WhatsAppService(session.id, session.user_id);
            wa.init();
            activeSessions[session.id] = wa;
        }
    }
}

// Endpoint para despertar una sesión desde el frontend
app.post('/api/sessions/:id/restart', async (req, res) => {
    const { id } = req.params;
    const { userId } = req.body;

    console.log(`[API] Petición de reinicio para sesión: ${id}`);

    // Si ya existe, intentamos reiniciarla si está desconectada
    if (!activeSessions[id]) {
        const wa = new WhatsAppService(id, userId);
        wa.init();
        activeSessions[id] = wa;
    }

    res.json({ message: 'Procesando conexión' });
});

app.listen(PORT, () => {
    console.log(`🚀 [BACKEND] RapiCredi AI Heartbeat en puerto ${PORT}`);
    monitorSessions();
});
