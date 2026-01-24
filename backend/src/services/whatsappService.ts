import makeWASocket, {
    DisconnectReason,
    useMultiFileAuthState,
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore,
    WASocket,
    ConnectionState
} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import * as fs from 'fs';
import * as path from 'path';
import pino from 'pino';
import { AIService } from './aiService';

// Configuración Anti-Baneo
const MIN_DELAY = parseInt(process.env.MIN_DELAY || '5000');
const MAX_DELAY = parseInt(process.env.MAX_DELAY || '15000');
const SESSION_NAME = process.env.SESSION_NAME || 'rapicredi_auth_info';

export class WhatsAppService {
    private static instance: WhatsAppService;
    private sock: WASocket | null = null;
    private qrCallback: ((qr: string) => void) | null = null;
    private statusCallback: ((status: string) => void) | null = null;
    private aiService: AIService;

    private constructor() {
        this.aiService = AIService.getInstance();
        this.connectToWhatsApp();
    }

    public static getInstance(): WhatsAppService {
        if (!WhatsAppService.instance) {
            WhatsAppService.instance = new WhatsAppService();
        }
        return WhatsAppService.instance;
    }

    public setQRCallback(callback: (qr: string) => void) {
        this.qrCallback = callback;
    }

    public setStatusCallback(callback: (status: string) => void) {
        this.statusCallback = callback;
    }

    async connectToWhatsApp() {
        // Asegurar que existe el directorio de sesión
        const sessionPath = path.resolve(__dirname, '..', '..', 'sessions', SESSION_NAME);
        if (!fs.existsSync(path.dirname(sessionPath))) {
            fs.mkdirSync(path.dirname(sessionPath), { recursive: true });
        }

        const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
        const { version } = await fetchLatestBaileysVersion();

        this.sock = makeWASocket({
            version,
            logger: pino({ level: 'silent' }) as any,
            printQRInTerminal: true,
            auth: {
                creds: state.creds,
                keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' }) as any),
            },
            browser: ['RapiCréditos Pro', 'Chrome', '1.0.0'],
            generateHighQualityLinkPreview: true,
        });

        // Manejo de eventos de conexión
        this.sock.ev.on('connection.update', (update: Partial<ConnectionState>) => {
            const { connection, lastDisconnect, qr } = update;

            if (qr) {
                console.log('Nuevo QR generado');
                if (this.qrCallback) this.qrCallback(qr);
                if (this.statusCallback) this.statusCallback('qr_ready');
            }

            if (connection === 'close') {
                const shouldReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
                console.log('Conexión cerrada. Reconectando:', shouldReconnect);
                if (this.statusCallback) this.statusCallback('disconnected');

                if (shouldReconnect) {
                    this.connectToWhatsApp();
                } else {
                    console.log('Desconectado. Limpiando credenciales...');
                    // Opcional: Borrar sesión si se cerró sesión
                }
            } else if (connection === 'open') {
                console.log('¡Conexión WhatsApp Exitosa!');
                if (this.statusCallback) this.statusCallback('connected');
            }
        });

        // Guardar credenciales cuando se actualicen
        this.sock.ev.on('creds.update', saveCreds);

        // Escuchar mensajes entrantes (IA Conversacional)
        this.sock.ev.on('messages.upsert', async ({ messages, type }) => {
            if (type !== 'notify') return;

            for (const msg of messages) {
                if (!msg.key.fromMe && msg.message) {
                    const sender = msg.key.remoteJid;
                    const text = msg.message.conversation || msg.message.extendedTextMessage?.text;

                    if (sender && text) {
                        try {
                            // Simular "escribiendo..."
                            await this.sock!.sendPresenceUpdate('composing', sender);

                            // Delay aleatorio corto para parecer humano
                            await this.randomDelay(2000, 5000);

                            // Obtener nombre del contacto (si es posible)
                            const contactName = msg.pushName || 'Cliente';

                            // Generar respuesta con IA
                            const response = await this.aiService.chatWithClient(contactName, text);

                            // Enviar respuesta
                            await this.sock!.sendMessage(sender, { text: response });
                        } catch (e) {
                            console.error('Error respondiendo mensaje con IA:', e);
                        }
                    }
                }
            }
        });
    }

    /**
     * Envía un mensaje de recordatorio con medidas anti-baneo
     */
    async sendReminder(phone: string, message: string): Promise<boolean> {
        if (!this.sock) return false;

        try {
            // Formatear número (Asegurar formato internacional sin +)
            const jid = phone.includes('@s.whatsapp.net') ? phone : `${phone.replace(/\D/g, '')}@s.whatsapp.net`;

            // 1. Simular presencia (En línea)
            await this.sock.sendPresenceUpdate('available', jid);

            // 2. Simular "escribiendo..."
            await this.sock.sendPresenceUpdate('composing', jid);

            // 3. Esperar un tiempo humano basado en la longitud del mensaje
            // Aproximadamente 50ms por caracter + delay aleatorio
            const typingDuration = message.length * 50 + Math.random() * 1000;
            await this.delay(Math.min(typingDuration, 5000)); // Máximo 5s escribiendo

            // 4. Pausar "escribiendo"
            await this.sock.sendPresenceUpdate('paused', jid);

            // 5. Enviar mensaje
            await this.sock.sendMessage(jid, { text: message });

            console.log(`Mensaje enviado a ${phone}`);
            return true;
        } catch (error) {
            console.error(`Error enviando mensaje a ${phone}:`, error);
            return false;
        }
    }

    /**
     * Genera un delay aleatorio para evitar detección de bot
     */
    async randomDelay(min: number = MIN_DELAY, max: number = MAX_DELAY) {
        const ms = Math.floor(Math.random() * (max - min + 1) + min);
        await new Promise(resolve => setTimeout(resolve, ms));
    }

    private delay(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    public isConnected(): boolean {
        return !!this.sock?.user;
    }
}
