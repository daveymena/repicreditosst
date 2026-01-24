import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Check, Shield, Zap, Globe, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { initMercadoPago, Wallet } from '@mercadopago/sdk-react';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { toast } from "sonner";

// Inicializar MercadoPago dentro del componente o controlando errores
// initMercadoPago('APP_USR-23c2d74a-d01f-473e-a305-0e5999f023bc');

const Pricing = () => {
    const [currency, setCurrency] = useState<"COP" | "USD">("USD");
    const [price, setPrice] = useState(7);
    const [loading, setLoading] = useState(true);
    const [preferenceId, setPreferenceId] = useState<string | null>(null);

    useEffect(() => {
        try {
            initMercadoPago('APP_USR-23c2d74a-d01f-473e-a305-0e5999f023bc');
        } catch (e) {
            console.error("Error initializing MercadoPago", e);
        }
    }, []);

    // Detectar ubicación aproximada
    useEffect(() => {
        const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        console.log("Detected Timezone:", timeZone);

        // Lista simple de zonas horarias de Colombia/Latam
        if (timeZone.includes("Bogota") || timeZone.includes("Colombia")) {
            setCurrency("COP");
            setPrice(30000); // ~7.5 USD
            createMercadoPagoPreference();
        } else {
            setCurrency("USD");
            setPrice(7);
        }
        setLoading(false);
    }, []);

    // Crear preferencia en el backend
    const createMercadoPagoPreference = async () => {
        try {
            const response = await fetch('/api/payments/create-preference', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: 30000,
                    currency: 'COP',
                    description: 'Suscripción RapiCréditos Pro - Mensual'
                })
            });

            const data = await response.json();
            if (data.preferenceId) {
                setPreferenceId(data.preferenceId);
            }
        } catch (error) {
            console.error('Error creating preference:', error);
            toast.error('Error al configurar el pago');
        }
    };

    const handlePayPalApprove = (data: any, actions: any) => {
        return actions.order.capture().then((details: any) => {
            toast.success("Pago completado por " + details.payer.name.given_name);
            // Aquí llamarías a tu backend para activar la suscripción
        });
    };

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto py-12 px-4">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold mb-4">Planes Simples y Transparentes</h1>
                    <p className="text-muted-foreground text-lg">
                        Comienza con 15 días gratis. Cancela cuando quieras.
                    </p>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid md:grid-cols-2 gap-8 items-start"
                >
                    {/* Free Plan */}
                    <Card className="border-muted">
                        <CardHeader>
                            <CardTitle>Plan Inicial</CardTitle>
                            <CardDescription>Para probar la plataforma</CardDescription>
                            <div className="mt-4">
                                <span className="text-3xl font-bold">Gratis</span>
                                <span className="text-muted-foreground"> / 15 días</span>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-3">
                                <li className="flex items-center gap-2">
                                    <Check className="w-5 h-5 text-green-500" />
                                    <span>Gestión de hasta 5 clientes</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="w-5 h-5 text-green-500" />
                                    <span>Cálculo básico de préstamos</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="w-5 h-5 text-green-500" />
                                    <span>Acceso al Dashboard</span>
                                </li>
                            </ul>
                        </CardContent>
                        <CardFooter>
                            <Button variant="outline" className="w-full" disabled>
                                Plan Actual (Prueba)
                            </Button>
                        </CardFooter>
                    </Card>

                    {/* Pro Plan */}
                    <Card className="border-primary shadow-lg shadow-primary/10 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-2">
                            <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-none">
                                Recomendado
                            </Badge>
                        </div>
                        <CardHeader>
                            <CardTitle className="text-primary">Plan Pro</CardTitle>
                            <CardDescription>Todo el poder de la IA</CardDescription>
                            <div className="mt-4">
                                <span className="text-4xl font-bold">
                                    {currency === "USD" ? "$" : "$"} {price.toLocaleString()}
                                </span>
                                <span className="text-muted-foreground"> / mes</span>
                                {currency === "COP" && <span className="text-xs ml-2 text-muted-foreground">(COP)</span>}
                            </div>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-3">
                                <li className="flex items-center gap-2">
                                    <Check className="w-5 h-5 text-green-500" />
                                    <span>Clientes Ilimitados</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <Zap className="w-5 h-5 text-yellow-500" />
                                    <span>IA para cobros (Ollama)</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <Globe className="w-5 h-5 text-blue-500" />
                                    <span>Sincronización WhatsApp</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="w-5 h-5 text-green-500" />
                                    <span>Recibos PDF y Reportes</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <Shield className="w-5 h-5 text-primary" />
                                    <span>Soporte Prioritario</span>
                                </li>
                            </ul>
                        </CardContent>
                        <CardFooter className="flex-col gap-4">
                            <div className="w-full space-y-4">
                                {/* Tabs para elegir método de pago */}
                                <div className="flex gap-2 mb-4">
                                    <Button
                                        variant={currency === "COP" ? "default" : "outline"}
                                        className="flex-1"
                                        onClick={() => {
                                            setCurrency("COP");
                                            setPrice(30000);
                                            createMercadoPagoPreference();
                                        }}
                                    >
                                        🇨🇴 Pagar en COP
                                    </Button>
                                    <Button
                                        variant={currency === "USD" ? "default" : "outline"}
                                        className="flex-1"
                                        onClick={() => {
                                            setCurrency("USD");
                                            setPrice(7);
                                        }}
                                    >
                                        🌎 Pagar en USD
                                    </Button>
                                </div>

                                {/* Botón de MercadoPago */}
                                {currency === "COP" && (
                                    <div className="w-full">
                                        <p className="text-xs text-center mb-2 text-muted-foreground flex items-center justify-center gap-1">
                                            <CreditCard className="w-3 h-3" /> Pagos seguros con MercadoPago
                                        </p>
                                        {preferenceId ? (
                                            <Wallet initialization={{ preferenceId }} />
                                        ) : (
                                            <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white" onClick={createMercadoPagoPreference}>
                                                Generar Link de Pago
                                            </Button>
                                        )}
                                    </div>
                                )}

                                {/* Botón de PayPal */}
                                {currency === "USD" && (
                                    <div className="w-full">
                                        <p className="text-xs text-center mb-2 text-muted-foreground">
                                            💳 Pago seguro internacional
                                        </p>
                                        <PayPalScriptProvider options={{ clientId: "BAAtdQwVN8LvIoRstmHZWlo2ndcJBP8dFZdXLc8HJGdYUXstriO6mO0GJMZimkBCdZHotBkulELqeFm_R4", currency: "USD" }}>
                                            <PayPalButtons
                                                style={{ layout: "vertical", color: "blue" }}
                                                createOrder={(data, actions) => {
                                                    return actions.order.create({
                                                        intent: "CAPTURE",
                                                        purchase_units: [
                                                            {
                                                                description: "Suscripción RapiCréditos Pro",
                                                                amount: {
                                                                    currency_code: "USD",
                                                                    value: "7.00"
                                                                }
                                                            }
                                                        ]
                                                    });
                                                }}
                                                onApprove={handlePayPalApprove}
                                            />
                                        </PayPalScriptProvider>
                                    </div>
                                )}
                            </div>

                            <p className="text-xs text-center text-muted-foreground">
                                Garantía de devolución de 7 días. Cancela cuando quieras.
                            </p>
                        </CardFooter>
                    </Card>
                </motion.div>
            </div>
        </DashboardLayout>
    );
};

export default Pricing;
