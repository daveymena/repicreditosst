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
     * Responde a un mensaje del usuario (Modo Conversación / Soporte)
     */
    async chatWithClient(clientName: string, incomingMessage: string): Promise<string> {
        if (process.env.USE_LLM !== 'true') return "Hola, soy el asistente de RapiCréditos. En un momento te atenderemos.";

        const prompt = `
            Eres "RapiBot", el asistente inteligente de RapiCréditos Pro. 
            Estás hablando con el cliente ${clientName}.
            
            CONOCIMIENTO DE LA APP:
            - RapiCréditos es una plataforma de gestión de préstamos personales.
            - Interés: La tasa estándar es del 20% mensual (pueden variar según el prestamista).
            - Registro: Los clientes nuevos pueden registrarse mediante el link de registro que les envía su prestamista.
            - Solicitud: Al registrarse, el cliente puede pedir su préstamo de una vez, eligiendo cuotas y frecuencia.
            - Estados: Los préstamos pueden estar en Pendiente (esperando aprobación), Activo (vigente), Pagado (terminado) o En Mora (atrasado).
            - Pagos: Aceptamos Nequi, Bancolombia, Daviplata y Efectivo (coordinar con el asesor).
            - Mora: Los pagos atrasados generan cargos adicionales (según política del prestamista).
            
            REGLAS DE RESPUESTA:
            1. Si preguntan "¿Cómo obtengo un préstamo?", diles que deben completar el formulario en el link de registro que el asesor les envió.
            2. Si preguntan sobre el interés, diles que es del 20% mensual aprox.
            3. Si piden prórroga o cambios en el pago, diles: "Debo escalar esta solicitud al administrador para que revisen tu caso personalmente".
            4. Si preguntan por saldos o estados, pídeles que esperen a que un asesor humano revise su perfil.
            5. Mantén un tono amable, profesional y usa emojis 🏦💰✨.
            6. Sé conciso: máximo 60 palabras.
            7. Responde en español latino.

            MENSAJE DEL CLIENTE: "${incomingMessage}"
        `;

        try {
            const response = await axios.post(`${OLLAMA_URL}/api/generate`, {
                model: OLLAMA_MODEL,
                prompt: prompt,
                stream: false,
                options: {
                    num_predict: 150,
                    temperature: 0.6
                }
            }, {
                timeout: 30000
            });

            return response.data.response.trim();
        } catch (error) {
            console.error('Error en chat Ollama:', error);
            return `¡Hola ${clientName}! 👋 Gracias por escribir a *RapiCréditos Pro*. En este momento estoy procesando muchas solicitudes. 

📌 Si tienes dudas sobre un préstamo, recuerda que la tasa es del 20%. 
📌 Para nuevos créditos, solicita tu link de registro al asesor.

¡Un asesor humano te responderá en breve! 🏦✨`;
        }
    }
}
