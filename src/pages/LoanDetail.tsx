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
    interest_type?: string;
    installment_amount: number;
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


import { calculateEndDate, generateSchedule, formatCurrency, Frequency } from "@/lib/loanUtils";

const LoanDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loan, setLoan] = useState<Loan | null>(null);
    const [payments, setPayments] = useState<Payment[]>([]);
    const [schedule, setSchedule] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSavingPayment, setIsSavingPayment] = useState(false);
    const [showPaymentDialog, setShowPaymentDialog] = useState(false);

    // Payment form
    const [paymentForm, setPaymentForm] = useState({
        amount: "",
        method: "Efectivo",
        notes: "",
        installmentNumber: ""
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
            const loanData = data as any;
            setLoan(loanData);

            // Generate schedule for display
            const generatedSchedule = generateSchedule(
                loanData.start_date,
                loanData.frequency as Frequency,
                loanData.installments,
                loanData.installment_amount,
                loanData.paid_installments
            );
            setSchedule(generatedSchedule);

            // Set suggested payment amount
            setPaymentForm(prev => ({
                ...prev,
                amount: loanData.installment_amount.toString(),
                installmentNumber: (loanData.paid_installments + 1).toString()
            }));

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
                payment_number: parseInt(paymentForm.installmentNumber) || (loan.paid_installments || 0) + 1,
                payment_method: paymentForm.method,
                notes: paymentForm.notes,
                due_date: new Date().toISOString()
            });

            if (paymentError) throw paymentError;

            // 2. Update Loan Status
            const newPaidAmount = (loan.paid_amount || 0) + amount;
            const newRemainingAmount = Math.max(0, loan.total_amount - newPaidAmount);

            // If they paid exactly the installment amount or more, we count it as a paid installment
            // For simplicity, we increment paid_installments
            const newPaidInstallments = (loan.paid_installments || 0) + 1;
            const newStatus = newRemainingAmount <= 0 ? "completed" : "active";

            const { error: loanUpdateError } = await supabase
                .from("loans")
                .update({
                    paid_amount: newPaidAmount,
                    remaining_amount: newRemainingAmount,
                    paid_installments: newPaidInstallments,
                    status: newStatus,
                    updated_at: new Date().toISOString()
                })
                .eq("id", loan.id);

            if (loanUpdateError) throw loanUpdateError;

            toast.success("¡Pago registrado exitosamente!");
            setShowPaymentDialog(false);
            setPaymentForm({ amount: loan.installment_amount.toString(), method: "Efectivo", notes: "", installmentNumber: (newPaidInstallments + 1).toString() });
            loadLoanData();
            loadPayments();
        } catch (error: any) {
            console.error("Error registering payment:", error);
            toast.error(error.message || "Error al registrar el pago");
        } finally {
            setIsSavingPayment(false);
        }
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

    const handleDownloadReceipt = (payment: Payment) => {
        if (!loan) return;

        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        printWindow.document.write(`
            <html>
                <head>
                    <title>Recibo de Pago - ${loan.loan_number}</title>
                    <style>
                        body { font-family: 'Courier New', Courier, monospace; width: 300px; padding: 20px; border: 1px dashed #000; }
                        .header { text-align: center; border-bottom: 1px solid #000; padding-bottom: 10px; margin-bottom: 10px; }
                        .item { display: flex; justify-content: space-between; margin: 5px 0; }
                        .amount { font-size: 20px; font-weight: bold; text-align: center; margin: 15px 0; }
                        .footer { text-align: center; margin-top: 20px; font-size: 12px; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <strong>RAPICRÉDITOS SAAS</strong><br>
                        RECIBO DE CAJA
                    </div>
                    <div class="item"><span>Fecha:</span> <span>${new Date(payment.payment_date).toLocaleString()}</span></div>
                    <div class="item"><span>Crédito:</span> <span>${loan.loan_number}</span></div>
                    <div class="item"><span>Cliente:</span> <span>${loan.clients?.full_name}</span></div>
                    <div class="item"><span>Método:</span> <span>${payment.payment_method}</span></div>
                    <div class="amount">${formatCurrency(payment.amount)}</div>
                    <div class="item"><span>Concepto:</span> <span>Abono #${payment.payment_number}</span></div>
                    <div class="footer">¡SOPORTE DE PAGO EXITOSO!</div>
                    <script>window.onload = () => { window.print(); window.close(); }</script>
                </body>
            </html>
        `);
        printWindow.document.close();
    };

    const handleDownloadPazYSalvo = () => {
        if (!loan) return;
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;
        const date = new Date().toLocaleDateString();
        printWindow.document.write(`
            <html>
                <head>
                    <title>Paz y Salvo - ${loan.loan_number}</title>
                    <style>
                        body { font-family: sans-serif; padding: 40px; line-height: 1.6; }
                        .header { text-align: center; margin-bottom: 40px; }
                        .stamp { border: 4px solid #059669; color: #059669; display: inline-block; padding: 10px 20px; font-weight: bold; transform: rotate(-5deg); margin-top: 20px; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>CERTIFICADO DE PAZ Y SALVO</h1>
                        <p>Orden # ${loan.loan_number}</p>
                    </div>
                    <p>Se certifica que <strong>${loan.clients?.full_name}</strong> ha cancelado la totalidad de sus obligaciones vinculadas al préstamo <strong>${loan.loan_number}</strong>.</p>
                    <p>Monto Pagado: ${formatCurrency(loan.total_amount)}</p>
                    <p>Fecha de Expedición: ${date}</p>
                    <div style="text-align:center"><div class="stamp">TOTALMENTE PAGADO</div></div>
                    <script>window.onload = () => { window.print(); window.close(); }</script>
                </body>
            </html>
        `);
        printWindow.document.close();
    };

    if (isLoading) return <DashboardLayout><div className="flex items-center justify-center min-h-[400px]"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div></DashboardLayout>;
    if (!loan) return <DashboardLayout><div className="text-center py-20">No se encontró el préstamo.</div></DashboardLayout>;

    return (
        <DashboardLayout>
            <div className="space-y-8 pb-12">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => navigate("/loans")} className="rounded-full">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold text-foreground">Detalle del Préstamo</h1>
                            <div className="flex items-center gap-2">
                                <span className="text-muted-foreground">{loan.loan_number}</span>
                                <Badge variant="outline" className="bg-primary/5">{loan.clients?.full_name}</Badge>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {loan.status === 'completed' && (
                            <Button variant="outline" onClick={handleDownloadPazYSalvo} className="border-success text-success hover:bg-success/5">
                                <CheckCircle className="mr-2 w-5 h-5" />
                                Descargar Paz y Salvo
                            </Button>
                        )}
                        <Button
                            variant="outline"
                            onClick={() => navigate(`/loans/${loan.id}/edit`)}
                            className="flex"
                        >
                            <Calendar className="mr-2 w-4 h-4" />
                            Ajustar Plan
                        </Button>
                        <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
                            <DialogTrigger asChild>
                                <Button className="bg-gradient-primary hover:opacity-90 shadow-glow" disabled={loan.status === 'completed'}>
                                    <Plus className="mr-2 w-5 h-5" />
                                    {loan.status === 'completed' ? 'Préstamo Pagado' : 'Registrar Abono'}
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader><DialogTitle>Registrar Pago</DialogTitle><DialogDescription>Ingresa el monto para el abono #{paymentForm.installmentNumber}.</DialogDescription></DialogHeader>
                                <form onSubmit={handleRegisterPayment} className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <Label>Monto del Abono</Label>
                                        <div className="relative">
                                            <DollarSign className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                                            <Input required type="number" className="pl-10" value={paymentForm.amount} onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })} />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2"><Label># Cuota</Label><Input type="number" value={paymentForm.installmentNumber} onChange={(e) => setPaymentForm({ ...paymentForm, installmentNumber: e.target.value })} /></div>
                                        <div className="space-y-2"><Label>Método</Label><Input value={paymentForm.method} onChange={(e) => setPaymentForm({ ...paymentForm, method: e.target.value })} /></div>
                                    </div>
                                    <div className="space-y-2"><Label>Notas</Label><Textarea value={paymentForm.notes} onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })} placeholder="Ej: Pago por Nequi..." /></div>
                                    <DialogFooter>
                                        <Button type="button" variant="outline" onClick={() => setShowPaymentDialog(false)}>Cancelar</Button>
                                        <Button type="submit" disabled={isSavingPayment}>{isSavingPayment ? "Guardando..." : "Confirmar Pago"}</Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Resumen Financiero y Plan de Pagos */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="grid sm:grid-cols-3 gap-4">
                            <Card className="bg-primary/5 border-primary/10">
                                <CardContent className="pt-6">
                                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Monto Total</p>
                                    <p className="text-2xl font-bold">{formatCurrency(loan.total_amount)}</p>
                                </CardContent>
                            </Card>
                            <Card className="bg-success/5 border-success/10">
                                <CardContent className="pt-6">
                                    <p className="text-xs font-medium text-success uppercase tracking-wider mb-1">Total Pagado</p>
                                    <p className="text-2xl font-bold text-success">{formatCurrency(loan.paid_amount || 0)}</p>
                                </CardContent>
                            </Card>
                            <Card className="bg-destructive/5 border-destructive/10">
                                <CardContent className="pt-6">
                                    <p className="text-xs font-medium text-destructive uppercase tracking-wider mb-1">Saldo Pendiente</p>
                                    <p className="text-2xl font-bold text-destructive">{formatCurrency(loan.remaining_amount)}</p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Plan de Pagos Sugerido (Amortización) */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="text-lg">Plan de Pagos</CardTitle>
                                    <CardDescription>Cronograma de cuotas programadas</CardDescription>
                                </div>
                                <Calendar className="w-5 h-5 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="w-[80px]">#</TableHead>
                                                <TableHead>Fecha Programada</TableHead>
                                                <TableHead>Monto</TableHead>
                                                <TableHead>Estado</TableHead>
                                                <TableHead className="text-right">Acción</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {schedule.map((inst) => (
                                                <TableRow key={inst.number} className={inst.isPaid ? "opacity-60 bg-secondary/20" : ""}>
                                                    <TableCell className="font-medium">Cuota {inst.number}</TableCell>
                                                    <TableCell>{new Date(inst.date).toLocaleDateString()}</TableCell>
                                                    <TableCell className="font-semibold">{formatCurrency(inst.amount)}</TableCell>
                                                    <TableCell>
                                                        {inst.isPaid ? (
                                                            <Badge variant="outline" className="bg-success/10 text-success border-success/20">Pagada</Badge>
                                                        ) : (
                                                            <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">Pendiente</Badge>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        {!inst.isPaid && (
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                className="text-primary hover:text-primary hover:bg-primary/10 h-8"
                                                                onClick={() => {
                                                                    setPaymentForm(prev => ({
                                                                        ...prev,
                                                                        amount: inst.amount.toString(),
                                                                        installmentNumber: inst.number.toString()
                                                                    }));
                                                                    setShowPaymentDialog(true);
                                                                }}
                                                            >
                                                                Pagar
                                                            </Button>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Historial de Pagos Reales */}
                        <Card>
                            <CardHeader><CardTitle className="text-lg">Historial de Transacciones</CardTitle></CardHeader>
                            <CardContent>
                                {payments.length === 0 ? (
                                    <div className="text-center py-10 text-muted-foreground">No hay pagos registrados aún.</div>
                                ) : (
                                    <Table>
                                        <TableHeader>
                                            <TableRow><TableHead>Fecha</TableHead><TableHead>Monto</TableHead><TableHead>Método</TableHead><TableHead>Info</TableHead><TableHead className="text-right">Recibo</TableHead></TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {payments.map((p) => (
                                                <TableRow key={p.id}>
                                                    <TableCell>{new Date(p.payment_date).toLocaleDateString()}</TableCell>
                                                    <TableCell className="font-bold text-success">{formatCurrency(p.amount)}</TableCell>
                                                    <TableCell>{p.payment_method}</TableCell>
                                                    <TableCell>Abono #{p.payment_number}</TableCell>
                                                    <TableCell className="text-right"><Button variant="ghost" size="icon" onClick={() => handleDownloadReceipt(p)}><Download className="w-4 h-4" /></Button></TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Información Lateral */}
                    <div className="space-y-6">
                        <Card className="border-primary/20 bg-gradient-to-br from-card to-secondary/20">
                            <CardHeader><CardTitle className="text-lg">Detalles Técnicos</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Estado:</span>{getStatusBadge(loan.status)}</div>
                                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Tasa:</span><span className="font-medium">{loan.interest_rate}% {loan.interest_type || 'simple'}</span></div>
                                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Frecuencia:</span><span className="font-medium capitalize">{loan.frequency}</span></div>
                                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Progreso:</span><span className="font-medium">{loan.paid_installments} / {loan.installments} cuotas</span></div>
                                <Separator className="bg-primary/10" />
                                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Fecha Inicio:</span><span className="font-medium">{new Date(loan.start_date).toLocaleDateString()}</span></div>
                                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Vencimiento:</span><span className="font-medium">{new Date(loan.end_date).toLocaleDateString()}</span></div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader><CardTitle className="text-lg flex items-center gap-2"><User className="w-4 h-4 text-primary" />Cliente</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                <div><p className="font-bold text-lg leading-tight">{loan.clients?.full_name}</p><p className="text-sm text-muted-foreground">{loan.clients?.email}</p></div>
                                <div className="flex items-center gap-2 text-sm font-medium"><Phone className="w-4 h-4 text-success" />{loan.clients?.phone}</div>
                                <div className="flex gap-2">
                                    <Button variant="outline" className="flex-1" onClick={() => navigate(`/clients/${loan.clients?.id}`)}>Ver Perfil</Button>
                                    <Button variant="outline" size="icon" onClick={() => window.open(`https://wa.me/${loan.clients?.phone.replace(/\D/g, '')}`, '_blank')}><Phone className="w-4 h-4" /></Button>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-accent/5 border-accent/20">
                            <CardHeader><CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Notas Internas</CardTitle></CardHeader>
                            <CardContent><p className="text-sm italic">{loan.notes || "Sin notas registradas para este préstamo."}</p></CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default LoanDetail;
