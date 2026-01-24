import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
    ArrowLeft,
    Calculator,
    Calendar,
    DollarSign,
    Percent,
    Users,
    Clock,
    FileText,
    CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Client {
    id: string;
    full_name: string;
    phone: string;
}

interface LoanCalculation {
    totalInterest: number;
    totalAmount: number;
    installmentAmount: number;
    endDate: string;
}

const NewLoan = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [clients, setClients] = useState<Client[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [calculation, setCalculation] = useState<LoanCalculation | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        clientId: "",
        principalAmount: "",
        interestRate: "20",
        interestType: "simple",
        installments: "12",
        frequency: "monthly",
        startDate: new Date().toISOString().split("T")[0],
        notes: "",
        status: "active" as string
    });

    useEffect(() => {
        loadClients();
        if (id) {
            loadLoanData();
        } else {
            setIsFetching(false);
        }
    }, [id]);

    const loadLoanData = async () => {
        try {
            const { data, error } = await supabase
                .from("loans")
                .select("*")
                .eq("id", id)
                .single();

            if (error) throw error;
            if (data) {
                setFormData({
                    clientId: data.client_id,
                    principalAmount: data.principal_amount.toString(),
                    interestRate: data.interest_rate?.toString() || "20",
                    interestType: data.interest_type || "simple",
                    installments: data.installments?.toString() || "12",
                    frequency: data.frequency || "monthly",
                    startDate: data.start_date,
                    notes: data.notes || "",
                    status: data.status || "active"
                });
            }
        } catch (error) {
            console.error("Error loading loan:", error);
            toast.error("Error al cargar los datos del préstamo");
        } finally {
            setIsFetching(false);
        }
    };

    useEffect(() => {
        if (
            formData.principalAmount &&
            formData.interestRate &&
            formData.installments &&
            formData.startDate
        ) {
            calculateLoan();
        }
    }, [
        formData.principalAmount,
        formData.interestRate,
        formData.installments,
        formData.frequency,
        formData.startDate,
    ]);

    const loadClients = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                navigate("/login");
                return;
            }

            const { data, error } = await supabase
                .from("clients")
                .select("id, full_name, phone")
                .eq("user_id", user.id)
                .eq("status", "active")
                .order("full_name");

            if (error) throw error;
            setClients(data || []);
        } catch (error) {
            console.error("Error loading clients:", error);
            toast.error("Error al cargar los clientes");
        }
    };

    const calculateLoan = () => {
        const principal = parseFloat(formData.principalAmount);
        const rate = parseFloat(formData.interestRate) / 100;
        const installments = parseInt(formData.installments);

        if (isNaN(principal) || isNaN(rate) || isNaN(installments)) {
            return;
        }

        // Simple interest calculation
        const totalInterest = principal * rate;
        const totalAmount = principal + totalInterest;
        const installmentAmount = totalAmount / installments;

        // Calculate end date based on frequency
        const startDate = new Date(formData.startDate);
        let endDate = new Date(startDate);

        switch (formData.frequency) {
            case "daily":
                endDate.setDate(endDate.getDate() + installments);
                break;
            case "weekly":
                endDate.setDate(endDate.getDate() + installments * 7);
                break;
            case "biweekly":
                endDate.setDate(endDate.getDate() + installments * 15);
                break;
            case "monthly":
                endDate.setMonth(endDate.getMonth() + installments);
                break;
        }

        setCalculation({
            totalInterest,
            totalAmount,
            installmentAmount,
            endDate: endDate.toISOString().split("T")[0],
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.clientId) {
            toast.error("Por favor selecciona un cliente");
            return;
        }

        if (!calculation) {
            toast.error("Error en el cálculo del préstamo");
            return;
        }

        setIsLoading(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                navigate("/login");
                return;
            }

            // Generate loan number
            const loanNumber = `L - ${Date.now().toString().slice(-8)} `;

            const loanData = {
                user_id: user.id,
                client_id: formData.clientId,
                loan_number: loanNumber,
                principal_amount: parseFloat(formData.principalAmount),
                interest_rate: parseFloat(formData.interestRate),
                interest_type: formData.interestType,
                total_interest: calculation.totalInterest,
                total_amount: calculation.totalAmount,
                remaining_amount: calculation.totalAmount,
                paid_amount: 0,
                installments: parseInt(formData.installments),
                paid_installments: 0,
                installment_amount: calculation.installmentAmount,
                frequency: formData.frequency,
                start_date: formData.startDate,
                end_date: calculation.endDate,
                status: "active",
                notes: formData.notes || null,
            };

            const { error } = await supabase.from("loans").insert([loanData]);

            if (error) throw error;

            toast.success("¡Préstamo creado exitosamente!");
            navigate("/loans");
        } catch (error) {
            console.error("Error creating loan:", error);
            toast.error("Error al crear el préstamo");
        } finally {
            setIsLoading(false);
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

    return (
        <DashboardLayout>
            <div className="space-y-8">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate("/loans")}
                        className="hover:bg-secondary"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Nuevo Préstamo</h1>
                        <p className="text-muted-foreground">
                            Crea un nuevo préstamo con cálculo automático de cuotas
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Form Section */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Client Selection */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Users className="w-5 h-5 text-primary" />
                                        Información del Cliente
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="clientSearch">Buscar Cliente *</Label>
                                        <div className="relative">
                                            <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                                            <Input
                                                id="clientSearch"
                                                list="clientsList"
                                                placeholder="Escribe para buscar (Nombre o Teléfono)..."
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    const selected = clients.find(c =>
                                                        c.full_name === value ||
                                                        `${c.full_name} - ${c.phone} ` === value
                                                    );
                                                    if (selected) {
                                                        setFormData({ ...formData, clientId: selected.id });
                                                    }
                                                }}
                                                className="pl-10"
                                                autoComplete="off"
                                            />
                                            <datalist id="clientsList">
                                                {clients.map((client) => (
                                                    <option key={client.id} value={`${client.full_name} - ${client.phone} `} />
                                                ))}
                                            </datalist>
                                        </div>
                                        {formData.clientId && (
                                            <p className="text-xs text-green-600 flex items-center mt-1">
                                                <CheckCircle className="w-3 h-3 mr-1" />
                                                Cliente seleccionado: {clients.find(c => c.id === formData.clientId)?.full_name}
                                            </p>
                                        )}
                                        {clients.length === 0 && (
                                            <p className="text-sm text-muted-foreground">
                                                No hay clientes disponibles.{" "}
                                                <Button
                                                    variant="link"
                                                    className="p-0 h-auto"
                                                    onClick={() => navigate("/clients/new")}
                                                >
                                                    Crear nuevo cliente
                                                </Button>
                                            </p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Loan Details */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Calculator className="w-5 h-5 text-primary" />
                                        Detalles del Préstamo
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="amount">Monto del Préstamo *</Label>
                                            <div className="relative">
                                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                                                <Input
                                                    id="amount"
                                                    type="number"
                                                    placeholder="1000000"
                                                    value={formData.principalAmount}
                                                    onChange={(e) =>
                                                        setFormData({ ...formData, principalAmount: e.target.value })
                                                    }
                                                    className="pl-10"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="interest">Tasa de Interés (%) *</Label>
                                            <div className="relative">
                                                <Percent className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                                                <Input
                                                    id="interest"
                                                    type="number"
                                                    step="0.1"
                                                    placeholder="20"
                                                    value={formData.interestRate}
                                                    onChange={(e) =>
                                                        setFormData({ ...formData, interestRate: e.target.value })
                                                    }
                                                    className="pl-10"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="installments">Número de Cuotas *</Label>
                                            <div className="relative">
                                                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                                                <Input
                                                    id="installments"
                                                    type="number"
                                                    placeholder="12"
                                                    value={formData.installments}
                                                    onChange={(e) =>
                                                        setFormData({ ...formData, installments: e.target.value })
                                                    }
                                                    className="pl-10"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="frequency">Frecuencia de Pago *</Label>
                                            <Select
                                                value={formData.frequency}
                                                onValueChange={(value) =>
                                                    setFormData({ ...formData, frequency: value })
                                                }
                                            >
                                                <SelectTrigger id="frequency">
                                                    <Clock className="mr-2 w-4 h-4" />
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

                                        <div className="space-y-2">
                                            <Label htmlFor="startDate">Fecha de Inicio *</Label>
                                            <div className="relative">
                                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                                                <Input
                                                    id="startDate"
                                                    type="date"
                                                    value={formData.startDate}
                                                    onChange={(e) =>
                                                        setFormData({ ...formData, startDate: e.target.value })
                                                    }
                                                    className="pl-10"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="interestType">Tipo de Interés</Label>
                                            <Select
                                                value={formData.interestType}
                                                onValueChange={(value) =>
                                                    setFormData({ ...formData, interestType: value })
                                                }
                                            >
                                                <SelectTrigger id="interestType">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="simple">Interés Simple</SelectItem>
                                                    <SelectItem value="compound">Interés Compuesto</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="notes">Notas (Opcional)</Label>
                                        <Textarea
                                            id="notes"
                                            placeholder="Información adicional sobre el préstamo..."
                                            value={formData.notes}
                                            onChange={(e) =>
                                                setFormData({ ...formData, notes: e.target.value })
                                            }
                                            rows={3}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Calculation Summary */}
                        <div className="space-y-6">
                            <Card className="sticky top-6">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Calculator className="w-5 h-5 text-primary" />
                                        Resumen del Préstamo
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {calculation ? (
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="space-y-4"
                                        >
                                            <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                                                <p className="text-sm text-muted-foreground mb-1">
                                                    Monto del Préstamo
                                                </p>
                                                <p className="text-2xl font-bold text-foreground">
                                                    {formatCurrency(parseFloat(formData.principalAmount))}
                                                </p>
                                            </div>

                                            <div className="space-y-3">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm text-muted-foreground">
                                                        Interés Total
                                                    </span>
                                                    <span className="font-semibold">
                                                        {formatCurrency(calculation.totalInterest)}
                                                    </span>
                                                </div>

                                                <div className="flex justify-between items-center pt-3 border-t">
                                                    <span className="text-sm font-medium">Total a Pagar</span>
                                                    <span className="text-lg font-bold text-primary">
                                                        {formatCurrency(calculation.totalAmount)}
                                                    </span>
                                                </div>

                                                <div className="flex justify-between items-center pt-3 border-t">
                                                    <span className="text-sm font-medium">Valor por Cuota</span>
                                                    <span className="text-xl font-bold text-accent">
                                                        {formatCurrency(calculation.installmentAmount)}
                                                    </span>
                                                </div>

                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm text-muted-foreground">
                                                        Número de Cuotas
                                                    </span>
                                                    <span className="font-semibold">{formData.installments}</span>
                                                </div>

                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm text-muted-foreground">
                                                        Fecha de Inicio
                                                    </span>
                                                    <span className="font-semibold">
                                                        {new Date(formData.startDate).toLocaleDateString("es-CO")}
                                                    </span>
                                                </div>

                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm text-muted-foreground">
                                                        Fecha de Finalización
                                                    </span>
                                                    <span className="font-semibold">
                                                        {new Date(calculation.endDate).toLocaleDateString("es-CO")}
                                                    </span>
                                                </div>
                                            </div>

                                            <Button
                                                type="submit"
                                                className="w-full bg-gradient-primary hover:opacity-90 text-primary-foreground shadow-glow"
                                                disabled={isLoading || !formData.clientId}
                                            >
                                                {isLoading ? (
                                                    <>
                                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                                        Creando...
                                                    </>
                                                ) : (
                                                    <>
                                                        <CheckCircle className="mr-2 w-5 h-5" />
                                                        Crear Préstamo
                                                    </>
                                                )}
                                            </Button>
                                        </motion.div>
                                    ) : (
                                        <div className="text-center py-8">
                                            <Calculator className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                                            <p className="text-sm text-muted-foreground">
                                                Completa los datos para ver el cálculo
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
};

export default NewLoan;
