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

        // Prompt ultra-corto para velocidad
        const prompt = `Mensaje de cobro amable para WhatsApp. Cliente: ${context.clientName}, Monto: $${context.amount}, Vence: ${context.dueDate}. Usa emojis 💰📅. Max 40 palabras.`;

        try {
            const response = await axios.post(`${OLLAMA_URL}/api/generate`, {
                model: OLLAMA_MODEL,
                prompt: prompt,
                stream: false,
                options: {
                    num_predict: 80,
                    temperature: 0.7
                }
            }, {
                timeout: 15000  // 15 seg timeout
            });

            return response.data.response.trim() || `Hola ${context.clientName} 👋, te recordamos tu pago de $${context.amount} que vence el ${context.dueDate}. ¡Gracias! 💰`;
        } catch (error: any) {
            console.error('⚠️ Ollama timeout:', error.message);
            // Mensaje con datos de pago
            return `Hola ${context.clientName} 👋

Te recordamos amablemente tu pago de *$${context.amount.toLocaleString()}* que vence el ${context.dueDate}. 📅

💳 *Opciones de Pago:*
• Nequi: 313-617-4267
• Bancolombia: 123-456789-01
• Daviplata: 313-617-4267

¡Gracias por tu confianza! 💚

_RapiCréditos Pro_`;
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
