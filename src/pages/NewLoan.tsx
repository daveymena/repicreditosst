import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    ArrowLeft,
    Calculator,
    Calendar,
    DollarSign,
    Percent,
    Users,
    Clock,
    CheckCircle,
    Sparkles,
    ChevronRight,
    Wallet,
    Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";

const PRESET_AMOUNTS = [100000, 200000, 500000, 1000000, 2000000];

const NewLoan = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [clients, setClients] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);

    const [formData, setFormData] = useState({
        clientId: searchParams.get("clientId") || "",
        principalAmount: "500000",
        interestRate: 20,
        installments: 12,
        frequency: "monthly",
        startDate: new Date().toISOString().split("T")[0],
        notes: ""
    });

    useEffect(() => {
        loadClients();
        loadUserDefaults();
    }, []);

    const loadUserDefaults = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            const { data: profile } = await supabase.from("profiles").select("default_interest_rate").eq("user_id", user.id).single();
            if (profile) setFormData(prev => ({ ...prev, interestRate: (profile as any).default_interest_rate || 20 }));
        } catch (e) { console.error(e); }
    };

    const loadClients = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) { navigate("/login"); return; }
            const { data } = await supabase.from("clients").select("id, full_name, phone").eq("user_id", user.id).eq("status", "active");
            setClients(data || []);
        } catch (e) { toast.error("Error cargando clientes"); }
        finally { setIsFetching(false); }
    };

    const calculateTotals = () => {
        const principal = parseFloat(formData.principalAmount);
        const rate = formData.interestRate / 100;
        const inst = formData.installments;
        const totalInterest = principal * rate;
        const totalAmount = principal + totalInterest;
        return {
            totalInterest,
            totalAmount,
            installmentAmount: totalAmount / inst
        };
    };

    const { totalInterest, totalAmount, installmentAmount } = calculateTotals();

    const handleCreateLoan = async () => {
        setIsLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { error } = await supabase.from("loans").insert({
                user_id: user.id,
                client_id: formData.clientId,
                loan_number: `L-${Date.now().toString().slice(-6)}`,
                principal_amount: parseFloat(formData.principalAmount),
                interest_rate: formData.interestRate,
                total_interest: totalInterest,
                total_amount: totalAmount,
                remaining_amount: totalAmount,
                paid_amount: 0,
                installments: formData.installments,
                paid_installments: 0,
                installment_amount: installmentAmount,
                frequency: formData.frequency,
                start_date: formData.startDate,
                status: "active",
                notes: formData.notes
            });

            if (error) throw error;
            toast.success("¡Préstamo desembolsado con éxito!");
            navigate("/loans");
        } catch (e: any) {
            toast.error(e.message || "Error al crear préstamo");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto space-y-8 pb-20">
                {/* Visual Stepper */}
                <div className="flex items-center justify-center gap-4 mb-8">
                    {[1, 2, 3].map((s) => (
                        <div key={s} className="flex items-center gap-2">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${step >= s ? 'bg-primary text-white shadow-glow' : 'bg-muted text-muted-foreground'}`}>
                                {s}
                            </div>
                            {s < 3 && <div className={`w-12 h-1 bg-muted rounded-full ${step > s ? 'bg-primary' : ''}`} />}
                        </div>
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            <div className="text-center space-y-2">
                                <h1 className="text-4xl font-black text-foreground">¿A quién le prestamos?</h1>
                                <p className="text-muted-foreground">Selecciona el cliente de tu lista de confianza</p>
                            </div>

                            <div className="grid gap-4">
                                {clients.map((client) => (
                                    <button
                                        key={client.id}
                                        onClick={() => {
                                            setFormData({ ...formData, clientId: client.id });
                                            setStep(2);
                                        }}
                                        className={`w-full p-6 rounded-[2rem] border-2 transition-all duration-300 flex items-center justify-between group ${formData.clientId === client.id ? 'border-primary bg-primary/5' : 'border-transparent bg-white shadow-sm hover:border-primary/30'}`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                                                <Users className="text-primary w-7 h-7" />
                                            </div>
                                            <div className="text-left">
                                                <p className="font-bold text-lg">{client.full_name}</p>
                                                <p className="text-sm text-muted-foreground">{client.phone}</p>
                                            </div>
                                        </div>
                                        <ChevronRight className={`w-6 h-6 transition-transform ${formData.clientId === client.id ? 'text-primary translate-x-1' : 'text-muted-foreground'}`} />
                                    </button>
                                ))}
                                <Button
                                    variant="outline"
                                    className="h-16 rounded-[2rem] border-dashed text-primary gap-2"
                                    onClick={() => navigate("/clients/new")}
                                >
                                    + Registrar nuevo cliente
                                </Button>
                            </div>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-8"
                        >
                            <div className="text-center space-y-2">
                                <h1 className="text-4xl font-black text-foreground">¿Cuánto vamos a prestar?</h1>
                                <p className="text-muted-foreground">Calcula el monto y las condiciones del crédito</p>
                            </div>

                            <Card className="stat-card border-none">
                                <CardContent className="p-8 space-y-10">
                                    {/* Pre-ajuste de montos */}
                                    <div className="space-y-4">
                                        <Label className="text-lg font-bold">Monto sugerido</Label>
                                        <div className="flex flex-wrap gap-3">
                                            {PRESET_AMOUNTS.map((amt) => (
                                                <button
                                                    key={amt}
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, principalAmount: amt.toString() })}
                                                    className={`px-6 py-3 rounded-2xl font-bold transition-all ${formData.principalAmount === amt.toString() ? 'bg-primary text-white shadow-glow' : 'bg-muted text-muted-foreground hover:bg-secondary'}`}
                                                >
                                                    {formatCurrency(amt)}
                                                </button>
                                            ))}
                                        </div>
                                        <div className="relative mt-4">
                                            <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-primary w-6 h-6" />
                                            <Input
                                                type="number"
                                                value={formData.principalAmount}
                                                onChange={(e) => setFormData({ ...formData, principalAmount: e.target.value })}
                                                className="h-16 pl-12 text-3xl font-black border-none bg-secondary/50 rounded-2xl"
                                                placeholder="0.00"
                                            />
                                        </div>
                                    </div>

                                    {/* Interés Slider */}
                                    <div className="space-y-6">
                                        <div className="flex justify-between items-end">
                                            <Label className="text-lg font-bold">Tasa de interés</Label>
                                            <span className="text-3xl font-black text-primary">{formData.interestRate}%</span>
                                        </div>
                                        <Slider
                                            value={[formData.interestRate]}
                                            onValueChange={([v]) => setFormData({ ...formData, interestRate: v })}
                                            max={50}
                                            step={1}
                                            className="cursor-pointer"
                                        />
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-8">
                                        <div className="space-y-4">
                                            <Label className="font-bold">Número de cuotas</Label>
                                            <div className="flex items-center gap-4">
                                                <Button type="button" variant="outline" className="w-12 h-12 rounded-xl" onClick={() => setFormData(f => ({ ...f, installments: Math.max(1, f.installments - 1) }))}>-</Button>
                                                <span className="text-2xl font-bold flex-1 text-center">{formData.installments}</span>
                                                <Button type="button" variant="outline" className="w-12 h-12 rounded-xl" onClick={() => setFormData(f => ({ ...f, installments: f.installments + 1 }))}>+</Button>
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <Label className="font-bold">Ciclo de pago</Label>
                                            <Select value={formData.frequency} onValueChange={(v) => setFormData({ ...formData, frequency: v })}>
                                                <SelectTrigger className="h-12 rounded-xl bg-secondary/50 border-none">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="daily">Diario</SelectItem>
                                                    <SelectItem value="weekly">Semanal</SelectItem>
                                                    <SelectItem value="biweekly">Quincenal</SelectItem>
                                                    <SelectItem value="monthly">Mensual</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="flex gap-4">
                                <Button variant="ghost" className="h-14 flex-1 rounded-2xl" onClick={() => setStep(1)}>
                                    <ArrowLeft className="mr-2" /> Atrás
                                </Button>
                                <Button className="h-14 flex-[2] rounded-2xl bg-gradient-primary shadow-glow text-lg font-bold" onClick={() => setStep(3)}>
                                    Ver resumen <ChevronRight className="ml-2" />
                                </Button>
                            </div>
                        </motion.div>
                    )}

                    {step === 3 && (
                        <motion.div
                            key="step3"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="space-y-8"
                        >
                            <div className="text-center space-y-2">
                                <h1 className="text-4xl font-black text-foreground">Confirmemos el trato</h1>
                                <p className="text-muted-foreground">Revisa que toda la información sea correcta antes de desembolsar</p>
                            </div>

                            <div className="grid md:grid-cols-5 gap-8">
                                <Card className="md:col-span-3 stat-card border-none bg-gradient-to-br from-indigo-900 to-violet-900 text-white">
                                    <div className="absolute top-0 right-0 p-32 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20"></div>
                                    <CardContent className="p-8 space-y-8 relative z-10">
                                        <div className="flex items-center gap-4">
                                            <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center">
                                                <Sparkles className="text-yellow-400 w-8 h-8" />
                                            </div>
                                            <div>
                                                <p className="text-indigo-200 text-sm font-bold uppercase tracking-widest">Resumen del Crédito</p>
                                                <h3 className="text-3xl font-black">Plan Profesional</h3>
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            <div className="flex justify-between items-center decoration-dotted border-b border-white/10 pb-4">
                                                <span className="text-indigo-200">Capital a prestar</span>
                                                <span className="text-2xl font-bold">{formatCurrency(parseFloat(formData.principalAmount))}</span>
                                            </div>
                                            <div className="flex justify-between items-center border-b border-white/10 pb-4">
                                                <span className="text-indigo-200">Intereses ({formData.interestRate}%)</span>
                                                <span className="text-xl font-semibold text-emerald-400">+{formatCurrency(totalInterest)}</span>
                                            </div>
                                            <div className="flex justify-between items-center py-4 bg-white/10 rounded-2xl px-6">
                                                <div>
                                                    <p className="text-xs text-indigo-300 font-bold uppercase">Monto Total</p>
                                                    <p className="text-3xl font-black text-white">{formatCurrency(totalAmount)}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xs text-indigo-300 font-bold uppercase">Por Cuota</p>
                                                    <p className="text-2xl font-bold text-yellow-400">{formatCurrency(installmentAmount)}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-white/5 p-4 rounded-xl">
                                                <p className="text-[10px] text-indigo-300 uppercase font-bold">Frecuencia</p>
                                                <p className="font-bold flex items-center gap-2 mt-1">
                                                    <Clock className="w-4 h-4 text-indigo-300" /> {formData.frequency}
                                                </p>
                                            </div>
                                            <div className="bg-white/5 p-4 rounded-xl">
                                                <p className="text-[10px] text-indigo-300 uppercase font-bold">Vencimiento estim.</p>
                                                <p className="font-bold flex items-center gap-2 mt-1">
                                                    <Calendar className="w-4 h-4 text-indigo-300" /> {formData.installments} cuotas
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <div className="md:col-span-2 space-y-6">
                                    <Card className="glass-card">
                                        <CardContent className="p-6 space-y-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                    <Users className="w-5 h-5 text-primary" />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-muted-foreground font-bold uppercase">Cobrar a:</p>
                                                    <p className="font-bold">{clients.find(c => c.id === formData.clientId)?.full_name}</p>
                                                </div>
                                            </div>
                                            <Separator />
                                            <div className="bg-yellow-50 dark:bg-yellow-900/10 p-4 rounded-2xl border border-yellow-100 dark:border-yellow-900/20 flex gap-3">
                                                <Info className="w-5 h-5 text-yellow-600 shrink-0" />
                                                <p className="text-xs text-yellow-700 dark:text-yellow-400">
                                                    Al desembolsar, se generará una deuda activa en el perfil del cliente y se habilitarán los recordatorios automáticos.
                                                </p>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Button
                                        className="w-full h-16 rounded-[2rem] bg-gradient-primary shadow-glow text-lg font-black button-shimmer"
                                        disabled={isLoading}
                                        onClick={handleCreateLoan}
                                    >
                                        {isLoading ? "Procesando..." : "DESEMBOLSAR AHORA"}
                                    </Button>
                                    <Button variant="ghost" className="w-full h-12 rounded-xl" onClick={() => setStep(2)}>
                                        <ArrowLeft className="w-4 h-4 mr-2" /> Realizar ajustes
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </DashboardLayout>
    );
};

export default NewLoan;
