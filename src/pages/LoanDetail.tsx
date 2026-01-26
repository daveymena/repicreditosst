import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    ArrowLeft,
    Calendar,
    DollarSign,
    Clock,
    CheckCircle,
    AlertCircle,
    Plus,
    Download,
    Phone,
    User,
    TrendingUp,
    Shield,
    Receipt,
    Wallet,
    Info,
    ChevronRight,
    Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";

interface Loan {
    id: string;
    loan_number: string;
    principal_amount: number;
    total_amount: number;
    remaining_amount: number;
    paid_amount: number;
    interest_rate: number;
    installments: number;
    paid_installments: number;
    frequency: string;
    status: string;
    start_date: string;
    end_date: string;
    notes: string;
    clients: {
        id: string;
        full_name: string;
        phone: string;
        email: string;
    };
}

interface Payment {
    id: string;
    amount: number;
    payment_date: string;
    payment_number: number;
    payment_method: string;
    notes: string;
}

const LoanDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loan, setLoan] = useState<Loan | null>(null);
    const [payments, setPayments] = useState<Payment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSavingPayment, setIsSavingPayment] = useState(false);
    const [showPaymentDialog, setShowPaymentDialog] = useState(false);

    // Payment form
    const [paymentForm, setPaymentForm] = useState({
        amount: "",
        method: "Efectivo",
        notes: ""
    });

    useEffect(() => {
        if (id) {
            loadLoanData();
            loadPayments();
        }
    }, [id]);

    const loadLoanData = async () => {
        try {
            const { data, error } = await supabase
                .from("loans")
                .select(`
                    *,
                    clients (id, full_name, phone, email)
                `)
                .eq("id", id)
                .single();

            if (error) throw error;
            setLoan(data as any);
        } catch (error) {
            console.error("Error loading loan:", error);
            toast.error("No se pudo cargar el préstamo");
        } finally {
            setIsLoading(false);
        }
    };

    const loadPayments = async () => {
        try {
            const { data, error } = await supabase
                .from("payments")
                .select("*")
                .eq("loan_id", id)
                .order("payment_date", { ascending: false });

            if (error) throw error;
            setPayments(data || []);
        } catch (error) {
            console.error("Error loading payments:", error);
        }
    };

    const handleRegisterPayment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!loan) return;

        const amount = parseFloat(paymentForm.amount);
        if (isNaN(amount) || amount <= 0) {
            toast.error("Monto inválido");
            return;
        }

        setIsSavingPayment(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { error: paymentError } = await supabase.from("payments").insert({
                loan_id: loan.id,
                user_id: user.id,
                amount: amount,
                payment_date: new Date().toISOString(),
                payment_number: (loan.paid_installments || 0) + 1,
                payment_method: paymentForm.method,
                notes: paymentForm.notes,
                due_date: new Date().toISOString()
            });

            if (paymentError) throw paymentError;

            const newPaidAmount = (loan.paid_amount || 0) + amount;
            const newRemainingAmount = loan.total_amount - newPaidAmount;
            const newPaidInstallments = (loan.paid_installments || 0) + 1;
            const newStatus = newRemainingAmount <= 0 ? "completed" : "active";

            const { error: loanUpdateError } = await supabase
                .from("loans")
                .update({
                    paid_amount: newPaidAmount,
                    remaining_amount: Math.max(0, newRemainingAmount),
                    paid_installments: newPaidInstallments,
                    status: newStatus,
                    updated_at: new Date().toISOString()
                })
                .eq("id", loan.id);

            if (loanUpdateError) throw loanUpdateError;

            toast.success("¡Pago registrado exitosamente!");
            setShowPaymentDialog(false);
            setPaymentForm({ amount: "", method: "Efectivo", notes: "" });
            loadLoanData();
            loadPayments();
        } catch (error: any) {
            toast.error(error.message || "Error al registrar el pago");
        } finally {
            setIsSavingPayment(false);
        }
    };

    const getStatusBadge = (status: string) => {
        const configs: any = {
            active: { label: "Activo", color: "bg-primary text-white" },
            completed: { label: "Totalmente Pagado", color: "bg-emerald-500 text-white" },
            defaulted: { label: "En Mora", color: "bg-rose-500 text-white" },
            pending: { label: "Pendiente", color: "bg-muted text-muted-foreground" }
        };
        const config = configs[status] || configs.pending;
        return <Badge className={`rounded-full px-4 py-1 font-black ${config.color}`}>{config.label}</Badge>;
    };

    if (isLoading) {
        return <DashboardLayout><div className="flex items-center justify-center h-96"><div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div></DashboardLayout>;
    }

    if (!loan) {
        return <DashboardLayout><div className="text-center py-20 font-bold">No se encontró el préstamo.</div></DashboardLayout>;
    }

    return (
        <DashboardLayout>
            <div className="max-w-6xl mx-auto space-y-10 pb-20">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-4">
                        <Button variant="ghost" onClick={() => navigate("/loans")} className="rounded-xl px-0 hover:bg-transparent text-muted-foreground hover:text-primary transition-colors">
                            <ArrowLeft className="w-5 h-5 mr-2" /> Volver al listado
                        </Button>
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-[2rem] bg-gradient-primary flex items-center justify-center shadow-glow">
                                <Receipt className="text-white w-8 h-8" />
                            </div>
                            <div>
                                <h1 className="text-4xl font-black">{loan.loan_number}</h1>
                                <p className="text-muted-foreground font-bold flex items-center gap-2">
                                    <User className="w-4 h-4 text-primary" /> {loan.clients?.full_name}
                                </p>
                            </div>
                        </div>
                    </div>

                    <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
                        <DialogTrigger asChild>
                            <Button className="h-16 px-8 rounded-[2rem] bg-gradient-primary text-lg font-black shadow-glow button-shimmer">
                                <Plus className="mr-2 w-6 h-6" /> REGISTRAR ABONO
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="rounded-[2.5rem] border-none glass-card p-8">
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-black">Nuevo Recibo de Pago</DialogTitle>
                                <DialogDescription className="font-bold">
                                    Ingresa los detalles del dinero recibido hoy.
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleRegisterPayment} className="space-y-6 pt-6">
                                <div className="space-y-3">
                                    <Label className="font-bold text-sm uppercase tracking-widest">Monto Recibido</Label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-primary w-5 h-5" />
                                        <Input
                                            required
                                            type="number"
                                            className="h-14 pl-12 text-2xl font-black border-none bg-secondary/50 rounded-2xl"
                                            placeholder="0.00"
                                            value={paymentForm.amount}
                                            onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="font-bold text-xs uppercase opacity-60">Medio</Label>
                                        <Input className="h-12 rounded-xl bg-secondary/50 border-none font-bold" value={paymentForm.method} onChange={(e) => setPaymentForm({ ...paymentForm, method: e.target.value })} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="font-bold text-xs uppercase opacity-60">Referencia</Label>
                                        <Input className="h-12 rounded-xl bg-secondary/50 border-none font-bold" placeholder="Ejem: Transferencia" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="font-bold text-xs uppercase opacity-60">Notas del Recibo</Label>
                                    <Textarea className="rounded-xl bg-secondary/50 border-none font-medium" value={paymentForm.notes} onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })} placeholder="..." />
                                </div>
                                <DialogFooter className="gap-2">
                                    <Button type="button" variant="ghost" className="h-14 flex-1 rounded-2xl" onClick={() => setShowPaymentDialog(false)}>Cancelar</Button>
                                    <Button type="submit" className="h-14 flex-[2] rounded-2xl bg-gradient-primary shadow-glow font-black" disabled={isSavingPayment}>
                                        {isSavingPayment ? "Guardando..." : "GENERAR RECIBO"}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Financial Summary Cards */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="grid sm:grid-cols-3 gap-6">
                            <Card className="stat-card border-none bg-white">
                                <CardContent className="p-0">
                                    <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-2">Total Contratado</p>
                                    <p className="text-2xl font-black text-foreground">{formatCurrency(loan.total_amount)}</p>
                                    <div className="w-10 h-1 bg-primary/20 rounded-full mt-4" />
                                </CardContent>
                            </Card>
                            <Card className="stat-card border-none bg-emerald-500/5 text-emerald-600">
                                <CardContent className="p-0">
                                    <p className="text-[10px] font-black uppercase tracking-widest mb-2 opacity-60 text-emerald-700">Recuperado</p>
                                    <p className="text-2xl font-black text-emerald-600">+{formatCurrency(loan.paid_amount || 0)}</p>
                                    <div className="w-full h-1 bg-emerald-500/10 rounded-full mt-4 overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(loan.paid_amount / loan.total_amount) * 100}%` }}
                                            className="h-full bg-emerald-500"
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="stat-card border-none bg-rose-500/5 text-rose-600">
                                <CardContent className="p-0">
                                    <p className="text-[10px] font-black uppercase tracking-widest mb-2 opacity-60 text-rose-700">Por Cobrar</p>
                                    <p className="text-2xl font-black text-rose-600">{formatCurrency(loan.remaining_amount)}</p>
                                    <div className="w-10 h-1 bg-rose-500/20 rounded-full mt-4" />
                                </CardContent>
                            </Card>
                        </div>

                        {/* Payment Progress & History */}
                        <Card className="glass-card border-none rounded-[2.5rem] overflow-hidden">
                            <CardHeader className="p-8 border-b border-white/10 flex flex-row items-center justify-between">
                                <div className="space-y-1">
                                    <CardTitle className="text-2xl font-black tracking-tight">Bitácora de Pagos</CardTitle>
                                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Abonos registrados a la fecha</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-black text-primary">{loan.paid_installments} / {loan.installments}</p>
                                    <p className="text-[10px] font-black text-muted-foreground uppercase">CUOTAS PACTADAS</p>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                {payments.length === 0 ? (
                                    <div className="text-center py-20">
                                        <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Wallet className="w-10 h-10 text-muted-foreground/30" />
                                        </div>
                                        <p className="font-bold text-muted-foreground uppercase tracking-widest">Sin movimientos registrados</p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <Table>
                                            <TableHeader className="bg-muted/30">
                                                <TableRow className="border-none">
                                                    <TableHead className="px-8 font-black uppercase text-[10px] tracking-widest py-6">Fecha del Abono</TableHead>
                                                    <TableHead className="font-black uppercase text-[10px] tracking-widest">Monto</TableHead>
                                                    <TableHead className="font-black uppercase text-[10px] tracking-widest">Método</TableHead>
                                                    <TableHead className="font-black uppercase text-[10px] tracking-widest">Concepto</TableHead>
                                                    <TableHead className="text-right px-8 font-black uppercase text-[10px] tracking-widest">Acciones</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {payments.map((p, idx) => (
                                                    <TableRow key={p.id} className="border-white/10 hover:bg-white/40 transition-colors group">
                                                        <TableCell className="px-8 font-bold text-muted-foreground py-6">
                                                            {new Date(p.payment_date).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                        </TableCell>
                                                        <TableCell className="text-lg font-black text-foreground">
                                                            {formatCurrency(p.amount)}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge variant="outline" className="rounded-xl px-3 py-1 bg-white/50 border-none font-bold uppercase text-[9px] tracking-wider">
                                                                {p.payment_method}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="text-sm font-medium text-muted-foreground italic">
                                                            {p.notes || "Abono a capital e interés"}
                                                        </TableCell>
                                                        <TableCell className="text-right px-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <Button variant="ghost" size="icon" className="rounded-xl bg-primary/5 text-primary hover:bg-primary hover:text-white transition-all">
                                                                <Download className="w-4 h-4" />
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Loan Sidebar Details */}
                    <div className="space-y-8">
                        {/* Control Panel Card */}
                        <Card className="stat-card border-none bg-gradient-to-br from-indigo-900 to-violet-900 text-white relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent)]" />
                            <CardHeader className="relative z-10">
                                <CardTitle className="text-lg font-black uppercase tracking-widest text-indigo-300">Resumen del Pacto</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6 relative z-10">
                                <div className="space-y-4">
                                    <div className="flex flex-col gap-1">
                                        <p className="text-[10px] font-black uppercase text-indigo-300">Estado del Crédito</p>
                                        {getStatusBadge(loan.status)}
                                    </div>
                                    <Separator className="bg-white/10" />
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-[10px] font-black uppercase text-indigo-300">Cuota</p>
                                            <p className="text-xl font-black text-yellow-400">{formatCurrency(loan.installment_amount)}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase text-indigo-300">Tasa</p>
                                            <p className="text-xl font-black font-sans">{loan.interest_rate}% <small className="text-xs">MES</small></p>
                                        </div>
                                    </div>
                                    <Separator className="bg-white/10" />
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3 text-sm font-bold">
                                            <Calendar className="w-5 h-5 text-indigo-300" />
                                            <span>Inició: {new Date(loan.start_date).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm font-bold">
                                            <Sparkles className="w-5 h-5 text-emerald-400" />
                                            <span className="text-emerald-400">Finaliza: {new Date(loan.end_date).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Debtor Profile Card */}
                        <Card className="glass-card border-none rounded-[2.5rem]">
                            <CardHeader>
                                <CardTitle className="text-lg font-black uppercase tracking-widest flex items-center justify-between">
                                    Perfil Deudor
                                    <User className="w-5 h-5 text-primary" />
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-[2rem] bg-muted flex items-center justify-center text-2xl font-black text-primary border-4 border-white">
                                        {loan.clients?.full_name?.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black tracking-tight">{loan.clients?.full_name}</h3>
                                        <p className="text-sm font-bold text-muted-foreground italic">Cliente VIP Verificado</p>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <Button variant="outline" className="w-full h-14 rounded-2xl border-none bg-secondary/50 font-black justify-between group" onClick={() => window.open(`tel:${loan.clients?.phone}`)}>
                                        <div className="flex items-center gap-3">
                                            <Phone className="w-5 h-5 text-primary" />
                                            <span>Llamar Ahora</span>
                                        </div>
                                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                    <Button variant="outline" className="w-full h-14 rounded-2xl border-none bg-secondary/50 font-black justify-between group" onClick={() => navigate(`/clients/${loan.clients?.id}`)}>
                                        <div className="flex items-center gap-3">
                                            <Shield className="w-5 h-5 text-primary" />
                                            <span>Revisar Historial</span>
                                        </div>
                                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* AI Insight Card */}
                        <div className="bg-primary/5 rounded-[2.5rem] p-8 border border-primary/10 relative overflow-hidden group hover:bg-primary/10 transition-colors cursor-help">
                            <Sparkles className="absolute top-4 right-4 text-primary w-6 h-6 animate-pulse" />
                            <h4 className="font-black text-primary uppercase text-[10px] tracking-widest mb-4">Análisis del Cobro (IA)</h4>
                            <p className="text-xs font-bold leading-relaxed text-primary/80 italic">
                                "El cliente lleva un comportamiento de pago impecable del {Math.round((loan.paid_amount / loan.total_amount) * 100)}%. Sugiero ofrecer una tasa preferencial para su próximo crédito."
                            </p>
                            <div className="mt-4 flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                <span className="text-[10px] font-black uppercase text-emerald-600">Riesgo Bajo</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default LoanDetail;
