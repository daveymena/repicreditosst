import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const OLLAMA_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.2:1b';

interface LoanContext {
    clientName: string;
    amount: number;
    dueDate: string;
    daysOverdue?: number;
}

export class AIService {
    private static instance: AIService;

    private constructor() { }

    public static getInstance(): AIService {
        if (!AIService.instance) {
            AIService.instance = new AIService();
        }
        return AIService.instance;
    }

    /**
     * Genera un mensaje de cobro persuasivo
     */
    async generateReminderMessage(context: LoanContext): Promise<string> {
        if (process.env.USE_LLM !== 'true') {
            return `Hola ${context.clientName}, recordamos tu pago de $${context.amount} para el día ${context.dueDate}.`;
        }

        const prompt = `
            Actúa como un asistente profesional de cobranzas para "RapiCréditos".
            Genera un mensaje corto, amable pero firme para enviar por WhatsApp.
            
            Datos del cliente:
            - Nombre: ${context.clientName}
            - Monto: $${context.amount}
            - Fecha de vencimiento: ${context.dueDate}
            ${context.daysOverdue ? `- Días de mora: ${context.daysOverdue}` : '- Estado: A tiempo (recordatorio preventivo)'}

            Instrucciones:
            1. Usa un tono empático pero profesional.
            2. Menciona la importancia de mantener un buen historial crediticio.
            3. Sé breve (máximo 50 palabras).
            4. No uses saludos genéricos como "Estimado cliente", usa su nombre.
            5. Incluye emojis sutiles (💰, 📅, ✨).
        `;

        try {
            const response = await axios.post(`${OLLAMA_URL}/api/generate`, {
                model: OLLAMA_MODEL,
                prompt: prompt,
                stream: false
            });

            return response.data.response.trim();
        } catch (error) {
            console.error('Error conectando con Ollama:', error);
            return `Hola ${context.clientName}, tienes un pago pendiente de $${context.amount} que vence el ${context.dueDate}. 📅`;
        }
    }

    /**
     * Responde a un mensaje del usuario (Modo Conversación)
     */
    async chatWithClient(clientName: string, incomingMessage: string): Promise<string> {
        const prompt = `
            Eres el asistente virtual de RapiCréditos. Estás hablando con el cliente ${clientName}.
            El cliente dice: "${incomingMessage}"

            Tu objetivo es:
            1. Responder dudas sobre pagos, horarios o saldos.
            2. Si piden prórroga, diles que deben contactar al administrador directamente.
            3. Sé muy amable y profesional en español latino.
            4. Mantén la respuesta corta (máximo 40 palabras).
        `;

        try {
            const response = await axios.post(`${OLLAMA_URL}/api/generate`, {
                model: OLLAMA_MODEL,
                prompt: prompt,
                stream: false
            });

            return response.data.response.trim();
        } catch (error) {
            console.error('Error en chat Ollama:', error);
            return "Lo siento, en este momento no puedo procesar tu mensaje. Por favor intenta más tarde o contacta a soporte.";
        }
    }
}
