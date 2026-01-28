import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Bot, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";

interface Message {
    id: string;
    text: string;
    sender: "user" | "bot";
    timestamp: Date;
}

const SupportChat = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "1",
            text: "¡Hola! Soy RapiBot 🤖. ¿En qué te puedo ayudar hoy? Pregúntame sobre préstamos, clientes o pagos.",
            sender: "bot",
            timestamp: new Date()
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
        if (!inputValue.trim()) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            text: inputValue,
            sender: "user",
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        setInputValue("");
        setIsTyping(true);

        try {
            console.log("RapiBot: Iniciando comunicación...");

            const CONTEXT = "ERES RAPIBOT, ASISTENTE DE RAPICRÉDITOS. RESPONDE CORTO Y AMABLE.";

            const response = await fetch("https://ollama-ollama.ginee6.easypanel.host/api/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    model: "llama3.2:1b",
                    prompt: `${CONTEXT}\n\nPregunta: ${userMsg.text}\nRespuesta:`,
                    stream: false,
                    options: { temperature: 0.3 }
                })
            });

            if (!response.ok) throw new Error("API Error");

            const data = await response.json();

            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                text: data.response,
                sender: "bot",
                timestamp: new Date()
            }]);

        } catch (error) {
            console.warn("RapiBot Fallback:", error);
            const fallback = generateResponse(userMsg.text);

            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                text: fallback,
                sender: "bot",
                timestamp: new Date()
            }]);

            if (error instanceof TypeError) {
                toast.error("Error de conexión. Revisa CORS en Easypanel.");
            }
        } finally {
            setIsTyping(false);
        }
    };

    const generateResponse = (query: string): string => {
        const q = query.toLowerCase();

        if (q.includes("crear") && (q.includes("prestamo") || q.includes("préstamo"))) {
            return "Para crear un préstamo, ve al menú 'Préstamos' y haz clic en 'Nuevo Préstamo'. Necesitarás seleccionar un cliente primero.";
        }
        if (q.includes("cliente") || q.includes("nuevo")) {
            return "Puedes registrar clientes en la sección 'Clientes' > 'Nuevo Cliente'. También puedes importarlos masivamente desde un Excel.";
        }
        if (q.includes("pago") || q.includes("pagar") || q.includes("abono")) {
            return "Para registrar un pago, ve al detalle del préstamo y usa el botón 'Registrar Abono' o 'Pagar' en la tabla de cuotas.";
        }
        if (q.includes("interes") || q.includes("tasa")) {
            return "Manejamos interés simple (fijo) y compuesto (sobre saldo). Puedes elegir el tipo al crear el préstamo.";
        }
        if (q.includes("contraseña") || q.includes("clave")) {
            return "Si olvidaste tu clave, usa la opción 'Recuperar contraseña' en el login. Te llegará un correo para restablecerla.";
        }
        if (q.includes("exportar") || q.includes("excel")) {
            return "Sí, puedes exportar tus datos de clientes y préstamos a Excel/CSV desde los botones en la parte superior de cada lista.";
        }

        return "Mmm, no estoy seguro de eso. ¿Podrías intentar preguntar de otra forma? También puedes consultar la sección de Ayuda en el menú.";
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
