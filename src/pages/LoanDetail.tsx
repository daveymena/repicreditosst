import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
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
    TrendingUp
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

            // 1. Register Payment
            const { error: paymentError } = await supabase.from("payments").insert({
                loan_id: loan.id,
                user_id: user.id,
                amount: amount,
                payment_date: new Date().toISOString(),
                payment_number: (loan.paid_installments || 0) + 1,
                payment_method: paymentForm.method,
                notes: paymentForm.notes,
                due_date: new Date().toISOString() // Fallback
            });

            if (paymentError) throw paymentError;

            // 2. Update Loan Status
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
            console.error("Error registering payment:", error);
            toast.error(error.message || "Error al registrar el pago");
        } finally {
            setIsSavingPayment(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("es-CO", {
            style: "currency",
            currency: "COP",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const getStatusBadge = (status: string) => {
        const configs: any = {
            active: { label: "Activo", variant: "default" },
            completed: { label: "Pagado", variant: "outline" },
            defaulted: { label: "En Mora", variant: "destructive" },
            pending: { label: "Pendiente", variant: "secondary" }
        };
        const config = configs[status] || configs.pending;
        return <Badge variant={config.variant}>{config.label}</Badge>;
    };

    if (isLoading) {
        return <DashboardLayout><div className="flex items-center justify-center h-96"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div></DashboardLayout>;
    }

    if (!loan) {
        return <DashboardLayout><div className="text-center py-20">No se encontró el préstamo.</div></DashboardLayout>;
    }

    return (
        <DashboardLayout>
            <div className="space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => navigate("/loans")} className="rounded-full">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold text-foreground">Detalle del Préstamo</h1>
                            <p className="text-muted-foreground">{loan.loan_number} - {loan.clients?.full_name}</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
                            <DialogTrigger asChild>
                                <Button className="bg-gradient-primary hover:opacity-90 shadow-glow">
                                    <Plus className="mr-2 w-5 h-5" />
                                    Registrar Abono
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Registrar Pago</DialogTitle>
                                    <DialogDescription>
                                        Ingresa el monto recibido para este préstamo.
                                    </DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleRegisterPayment} className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <Label>Monto del Abono</Label>
                                        <div className="relative">
                                            <DollarSign className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                                            <Input
                                                required
                                                type="number"
                                                className="pl-10"
                                                placeholder="Ej: 50000"
                                                value={paymentForm.amount}
                                                onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Método de Pago</Label>
                                        <Input
                                            value={paymentForm.method}
                                            onChange={(e) => setPaymentForm({ ...paymentForm, method: e.target.value })}
                                            placeholder="Efectivo, Nequi..."
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Notas</Label>
                                        <Textarea
                                            value={paymentForm.notes}
                                            onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                                            placeholder="Recibido por..."
                                        />
                                    </div>
                                    <DialogFooter>
                                        <Button type="button" variant="outline" onClick={() => setShowPaymentDialog(false)}>Cancelar</Button>
                                        <Button type="submit" disabled={isSavingPayment}>
                                            {isSavingPayment ? "Guardando..." : "Confirmar Pago"}
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Resumen Financiero */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="grid sm:grid-cols-3 gap-4">
                            <Card className="bg-primary/5 border-primary/20">
                                <CardContent className="pt-6">
                                    <p className="text-sm text-muted-foreground mb-1">Total a Pagar</p>
                                    <p className="text-xl font-bold">{formatCurrency(loan.total_amount)}</p>
                                </CardContent>
                            </Card>
                            <Card className="bg-success/5 border-success/20">
                                <CardContent className="pt-6">
                                    <p className="text-sm text-muted-foreground mb-1">Total Pagado</p>
                                    <p className="text-xl font-bold text-success">{formatCurrency(loan.paid_amount || 0)}</p>
                                </CardContent>
                            </Card>
                            <Card className="bg-destructive/5 border-destructive/20">
                                <CardContent className="pt-6">
                                    <p className="text-sm text-muted-foreground mb-1">Saldo Pendiente</p>
                                    <p className="text-xl font-bold text-destructive">{formatCurrency(loan.remaining_amount)}</p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Tabla de Pagos */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center justify-between">
                                    <span>Historial de Pagos</span>
                                    <TrendingUp className="w-4 h-4 text-muted-foreground" />
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {payments.length === 0 ? (
                                    <div className="text-center py-10 text-muted-foreground">No hay pagos registrados aún.</div>
                                ) : (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Fecha</TableHead>
                                                <TableHead>Monto</TableHead>
                                                <TableHead>Método</TableHead>
                                                <TableHead>Número</TableHead>
                                                <TableHead className="text-right">Acciones</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {payments.map((p) => (
                                                <TableRow key={p.id}>
                                                    <TableCell>{new Date(p.payment_date).toLocaleDateString()}</TableCell>
                                                    <TableCell className="font-bold">{formatCurrency(p.amount)}</TableCell>
                                                    <TableCell>{p.payment_method}</TableCell>
                                                    <TableCell>Abono #{p.payment_number}</TableCell>
                                                    <TableCell className="text-right">
                                                        <Button variant="ghost" size="sm"><Download className="w-4 h-4" /></Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Información del Préstamo */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Detalles Técnicos</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Estado:</span>
                                    {getStatusBadge(loan.status)}
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Tasa de Interés:</span>
                                    <span className="font-medium">{loan.interest_rate}% mensual</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Frecuencia:</span>
                                    <span className="font-medium">{loan.frequency}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Cuotas:</span>
                                    <span className="font-medium">{loan.paid_installments} / {loan.installments}</span>
                                </div>
                                <Separator />
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Fecha Inicio:</span>
                                    <span className="font-medium">{new Date(loan.start_date).toLocaleDateString()}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Vencimiento:</span>
                                    <span className="font-medium">{new Date(loan.end_date).toLocaleDateString()}</span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <User className="w-4 h-4 text-primary" />
                                    Cliente
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="font-bold text-lg">{loan.clients?.full_name}</p>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Phone className="w-4 h-4" />
                                    {loan.clients?.phone}
                                </div>
                                <Button variant="outline" className="w-full" onClick={() => navigate(`/clients/${loan.clients?.id}`)}>
                                    Ver Perfil del Cliente
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default LoanDetail;
