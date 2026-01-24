import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    Smartphone,
    CheckCircle,
    RefreshCcw,
    Bot,
    Sparkles,
    Send,
    MessageSquare,
    Loader2,
    Clock,
    ExternalLink,
    AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { toast } from "sonner";
import { QRCodeSVG } from 'qrcode.react';

const WhatsApp = () => {
    const [isConnected, setIsConnected] = useState(false);
    const [qrCode, setQrCode] = useState("");
    const [connectionStatus, setConnectionStatus] = useState("disconnected");

    // Polling al backend para obtener estado y QR
    useEffect(() => {
        const checkStatus = async () => {
            try {
                // NOTA: Asegúrate de que el backend esté corriendo en puerto 3001
                const res = await fetch('http://localhost:3001/api/whatsapp/status');
                const data = await res.json();

                setConnectionStatus(data.status);

                if (data.status === 'connected') {
                    setIsConnected(true);
                    setQrCode("");
                } else if (data.status === 'qr_ready') {
                    setIsConnected(false);
                    setQrCode(data.qr);
                } else {
                    setIsConnected(false);
                }
            } catch (error) {
                console.error("Error conectando con backend WhatsApp:", error);
            }
        };

        const interval = setInterval(checkStatus, 3000); // Revisar cada 3 segundos
        return () => clearInterval(interval);
    }, []);

    const handleDisconnect = async () => {
        try {
            await fetch('http://localhost:3001/api/whatsapp/disconnect', { method: 'POST' });
            setIsConnected(false);
            setQrCode("");
            toast.info("Solicitud de desconexión enviada");
        } catch (e) {
            toast.error("Error al desconectar");
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-8">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Sincronización de WhatsApp</h1>
                    <p className="text-muted-foreground">
                        Conecta tu cuenta para enviar recordatorios automáticos y mensajes con IA
                    </p>
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Connection Status & QR */}
                    <Card className="h-full border-muted/60 shadow-lg">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Smartphone className="w-5 h-5 text-primary" />
                                Estado de Conexión
                            </CardTitle>
                            <CardDescription>
                                Escanea el código QR para vincular tu dispositivo
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center justify-center min-h-[400px]">
                            {isConnected ? (
                                <motion.div
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="text-center space-y-6"
                                >
                                    <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto ring-4 ring-green-50">
                                        <CheckCircle className="w-12 h-12 text-green-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-foreground mb-2">¡Dispositivo Conectado!</h3>
                                        <p className="text-muted-foreground max-w-xs mx-auto">
                                            Tu sistema Baileys está activo y escuchando mensajes en tiempo real.
                                        </p>
                                    </div>
                                    <div className="flex flex-col gap-2 pt-4">
                                        <Badge variant="outline" className="px-4 py-1 mx-auto bg-green-50 text-green-700 border-green-200">
                                            ● En línea
                                        </Badge>
                                        <p className="text-xs text-muted-foreground">
                                            Sesión activa: {connectionStatus}
                                        </p>
                                    </div>
                                    <Button
                                        variant="outline"
                                        onClick={handleDisconnect}
                                        className="text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20 mt-4"
                                    >
                                        <RefreshCcw className="w-4 h-4 mr-2" />
                                        Desconectar Dispositivo
                                    </Button>
                                </motion.div>
                            ) : (
                                <div className="w-full max-w-sm space-y-8 text-center">
                                    <div className="relative bg-white p-6 rounded-3xl border-2 border-dashed border-gray-200 shadow-sm mx-auto w-64 h-64 flex items-center justify-center overflow-hidden">
                                        {qrCode ? (
                                            <QRCodeSVG value={qrCode} size={220} />
                                        ) : (
                                            <div className="flex flex-col items-center gap-4">
                                                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                                                <p className="text-sm text-muted-foreground font-medium">Esperando QR del servidor...</p>
                                                <p className="text-xs text-muted-foreground">Asegúrate que el backend esté corriendo</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-4">
                                        <p className="text-sm text-muted-foreground">
                                            1. Abre WhatsApp en tu teléfono <br />
                                            2. Menú {'>'} Dispositivos vinculados <br />
                                            3. Vincular un dispositivo
                                        </p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* AI Features & Bot Configuration */}
                    <div className="space-y-6">
                        <Card className="bg-gradient-to-br from-indigo-900 to-violet-900 text-white border-none shadow-xl overflow-hidden relative">
                            <div className="absolute top-0 right-0 p-32 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-white">
                                    <Bot className="w-6 h-6" />
                                    Cerebro con IA (Ollama)
                                </CardTitle>
                                <CardDescription className="text-indigo-200">
                                    Automatización con Llama 3.2
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6 relative z-10">
                                <div className="space-y-4">
                                    <div className="flex gap-4">
                                        <div className="p-3 bg-white/10 rounded-xl">
                                            <Bot className="w-8 h-8 text-indigo-300" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-lg">Asistente de Cobranza</h4>
                                            <p className="text-sm text-indigo-200 leading-relaxed mt-1">
                                                Configurado para detectar vencimientos y conversar amablemente.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="bg-white/10 rounded-xl p-4 mt-4 backdrop-blur-sm border border-white/10">
                                        <div className="flex items-center gap-2 text-xs font-bold text-indigo-300 uppercase mb-2">
                                            <Sparkles className="w-3 h-3" /> Estado del Servidor
                                        </div>
                                        <p className="text-sm text-indigo-100 flex justify-between">
                                            <span>Ollama AI:</span>
                                            <span className="font-bold text-green-400">Conectado ✅</span>
                                        </p>
                                        <p className="text-sm text-indigo-100 flex justify-between mt-1">
                                            <span>Scheduler:</span>
                                            <span className="font-bold text-green-400">Activo (8:00 AM)</span>
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-4">
                            <Card>
                                <CardContent className="p-4 flex items-center gap-3">
                                    <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                                        <Send className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Enviados Hoy</p>
                                        <p className="font-bold text-lg">0</p>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="p-4 flex items-center gap-3">
                                    <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                                        <MessageSquare className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Respuestas</p>
                                        <p className="font-bold text-lg">0</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default WhatsApp;
