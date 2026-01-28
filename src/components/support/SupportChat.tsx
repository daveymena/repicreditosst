import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Bot, User, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { getQuickResponse, BotVisualResponse } from "@/lib/botVisuals";
import { useNavigate } from "react-router-dom";

interface Message {
    id: string;
    text: string;
    sender: "user" | "bot";
    timestamp: Date;
    visual?: BotVisualResponse;
}

const SupportChat = () => {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "1",
            text: "¡Hola! Soy RapiBot 🤖. ¿En qué te puedo ayudar hoy?",
            sender: "bot",
            timestamp: new Date(),
            visual: getQuickResponse("prestamo") || undefined
        }
    ]);
    const [inputValue, setInputValue] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll al final
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, isTyping]);

    const handleSendMessage = async (e?: React.FormEvent) => {
        e?.preventDefault();
        const text = inputValue.trim();
        if (!text) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            text,
            sender: "user",
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        setInputValue("");

        // 1. REVISAR RESPUESTA INSTANTÁNEA (MÁS RÁPIDO)
        const quickRes = getQuickResponse(text);
        if (quickRes) {
            setTimeout(() => {
                setMessages(prev => [...prev, {
                    id: (Date.now() + 1).toString(),
                    text: quickRes.text,
                    sender: "bot",
                    timestamp: new Date(),
                    visual: quickRes
                }]);
            }, 500);
            return;
        }

        // 2. SI NO ES COMÚN, LLAMAR A LA IA
        setIsTyping(true);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000); // Darle 1 minuto completo

        try {
            const url = "https://ollama-ollama.ginee6.easypanel.host/api/generate";
            // console.log(`RapiBot: Enviando petición a ${url}...`);

            const CONTEXT = "Eres RapiBot, el asistente de RapiCréditos. Responde breve y profesional.";

            const response = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    model: "llama3.2:1b",
                    prompt: `${CONTEXT}\n\nPregunta: ${text}\nRespuesta:`,
                    stream: false,
                    options: {
                        temperature: 0.3,
                        num_thread: 4,
                        num_predict: 100
                    }
                }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) throw new Error("API Error");

            const data = await response.json();

            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                text: data.response,
                sender: "bot",
                timestamp: new Date()
            }]);

        } catch (error: any) {
            clearTimeout(timeoutId);
            // console.error("RapiBot Detalle Error:", error);

            const fallback = generateResponse(text);

            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                text: error.name === 'AbortError'
                    ? `Estoy procesando muchas solicitudes. Aquí tienes ayuda rápida: ${fallback}`
                    : fallback,
                sender: "bot",
                timestamp: new Date()
            }]);
        } finally {
            setIsTyping(false);
        }
    };

    const generateResponse = (query: string): string => {
        const q = query.toLowerCase();

        if (q.includes("crear")) {
            return "Para crear algo nuevo, usa los botones '+' en la parte superior de cada sección.";
        }
        if (q.includes("pago") || q.includes("abono")) {
            return "Puedes registrar abonos entrando al detalle del préstamo del cliente.";
        }
        return "Mmm, ¿podrías darme más detalles? También puedes ir al Centro de Ayuda en el menú lateral.";
    };

    return (
        <>
            {/* Botón Flotante */}
            <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(true)}
                className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-colors ${isOpen ? 'hidden' : 'bg-primary text-primary-foreground hover:bg-primary/90'}`}
            >
                <div className="relative">
                    <MessageCircle className="w-7 h-7" />
                    <span className="absolute top-0 right-0 w-3 h-3 bg-green-500 border-2 border-background rounded-full"></span>
                </div>
            </motion.button>

            {/* Ventana de Chat */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.95 }}
                        className="fixed bottom-6 right-6 z-50 w-[350px] md:w-[400px] h-[500px] bg-card border border-border rounded-xl shadow-2xl flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="p-4 bg-primary text-primary-foreground flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                                    <Bot className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-sm">Soporte RapiCréditos</h3>
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                                        <span className="text-xs opacity-90">En línea</span>
                                    </div>
                                </div>
                            </div>
                            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={() => setIsOpen(false)}>
                                <X className="w-5 h-5" />
                            </Button>
                        </div>

                        {/* Messages Area */}
                        <ScrollArea className="flex-1 p-4 bg-muted/30">
                            <div className="space-y-4">
                                {messages.map((msg) => (
                                    <div
                                        key={msg.id}
                                        className={`flex w-full ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                                    >
                                        <div
                                            className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.sender === "user"
                                                ? "bg-primary text-primary-foreground rounded-br-none"
                                                : "bg-background border border-border shadow-sm rounded-bl-none"
                                                }`}
                                        >
                                            <p>{msg.text}</p>
                                            <span className={`text-[10px] block mt-1 ${msg.sender === "user" ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                                                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                                {isTyping && (
                                    <div className="flex justify-start">
                                        <div className="bg-background border border-border shadow-sm rounded-2xl rounded-bl-none p-3 max-w-[80%]">
                                            <div className="flex gap-1">
                                                <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce"></span>
                                                <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce delay-75"></span>
                                                <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce delay-150"></span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div ref={scrollRef} />
                            </div>
                        </ScrollArea>

                        {/* Input Area */}
                        <div className="p-4 bg-background border-t border-border">
                            <form onSubmit={handleSendMessage} className="flex gap-2">
                                <Input
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    placeholder="Escribe tu pregunta..."
                                    className="flex-1"
                                    autoFocus
                                />
                                <Button type="submit" size="icon" disabled={!inputValue.trim() || isTyping}>
                                    <Send className="w-4 h-4" />
                                </Button>
                            </form>
                            <p className="text-[10px] text-center text-muted-foreground mt-2">
                                La IA puede cometer errores. Verifica la información.
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default SupportChat;
