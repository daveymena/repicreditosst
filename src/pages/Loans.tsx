import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    DollarSign,
    Search,
    Filter,
    Plus,
    Eye,
    Edit,
    Trash2,
    TrendingUp,
    AlertCircle,
    CheckCircle,
    Clock,
    Download,
    ChevronRight,
    Sparkles,
    Banknote,
    MoreVertical
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
    clients?: {
        full_name: string;
        phone: string;
    };
}

const Loans = () => {
    const [loans, setLoans] = useState<Loan[]>([]);
    const [filteredLoans, setFilteredLoans] = useState<Loan[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const navigate = useNavigate();

    useEffect(() => { loadLoans(); }, []);

    useEffect(() => {
        let filtered = loans.filter(l =>
            l.loan_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
            l.clients?.full_name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        if (statusFilter !== "all") filtered = filtered.filter(l => l.status === statusFilter);
        setFilteredLoans(filtered);
    }, [searchTerm, statusFilter, loans]);

    const loadLoans = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) { navigate("/login"); return; }
            const { data, error } = await supabase.from("loans").select("*, clients(full_name, phone)").eq("user_id", user.id).order("created_at", { ascending: false });
            if (error) throw error;
            setLoans(data || []);
        } catch (e) { toast.error("Error cargando préstamos"); }
        finally { setIsLoading(false); }
    };

    const handleDeleteLoan = async (id: string) => {
        if (!confirm("¿Deseas anular este préstamo?")) return;
        try {
            const { error } = await supabase.from("loans").delete().eq("id", id);
            if (error) throw error;
            toast.success("Préstamo eliminado");
            loadLoans();
        } catch (e) { toast.error("Error al eliminar"); }
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case "active": return "border-emerald-500/20 text-emerald-600 bg-emerald-500/5";
            case "completed": return "border-primary/20 text-primary bg-primary/5";
            case "defaulted": return "border-rose-500/20 text-rose-600 bg-rose-500/5";
            default: return "border-slate-500/20 text-slate-500 bg-slate-500/5";
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case "active": return "Cobro Activo";
            case "completed": return "Finalizado";
            case "defaulted": return "Cartera Mora";
            default: return status;
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto space-y-10 pb-20">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-4">
                    <div className="space-y-1">
                        <h1 className="text-4xl font-black text-foreground tracking-tight">Gestión de Créditos</h1>
                        <p className="text-muted-foreground font-bold flex items-center gap-2">
                            <Banknote className="w-5 h-5 text-primary" /> {loans.length} préstamos activos en tu sistema
                        </p>
                    </div>
                    <div className="flex gap-4">
                        <Button variant="outline" className="h-16 px-6 rounded-[2rem] font-black uppercase text-xs tracking-widest border-none bg-white shadow-sm" onClick={() => navigate("/simulator")}>
                            <TrendingUp className="mr-2 w-4 h-4" /> Simulador Pro
                        </Button>
                        <Button onClick={() => navigate("/loans/new")} className="h-16 px-8 rounded-[2rem] bg-gradient-primary text-lg font-black shadow-glow button-shimmer">
                            <Plus className="mr-2 w-6 h-6" /> NUEVO CRÉDITO
                        </Button>
                    </div>
                </div>

                {/* Filter Section */}
                <div className="flex flex-col sm:flex-row gap-4 px-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-primary" />
                        <input
                            placeholder="Buscar por crédito o nombre de cliente..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full h-16 pl-14 pr-6 bg-white/50 border-none rounded-[1.5rem] font-bold text-foreground placeholder:font-medium shadow-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                        />
                    </div>
                    <div className="flex gap-3">
                        {["all", "active", "completed", "defaulted"].map((s) => (
                            <button
                                key={s}
                                onClick={() => setStatusFilter(s)}
                                className={`px-6 h-16 rounded-[1.5rem] font-black uppercase text-[10px] tracking-widest transition-all ${statusFilter === s ? 'bg-black text-white shadow-xl scale-105' : 'bg-white text-muted-foreground hover:bg-white/80'}`}
                            >
                                {s === 'all' ? 'Ver Todo' : s === 'active' ? 'Activos' : s === 'completed' ? 'Pagados' : 'En Mora'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Loans Grid */}
                {isLoading ? (
                    <div className="flex items-center justify-center py-40">
                        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : filteredLoans.length === 0 ? (
                    <Card className="py-32 rounded-[3.5rem] glass-card border-none">
                        <CardContent className="text-center space-y-6">
                            <div className="w-24 h-24 rounded-[2.5rem] bg-primary/5 flex items-center justify-center mx-auto">
                                <DollarSign className="w-12 h-12 text-primary/30" />
                            </div>
                            <h3 className="text-2xl font-black text-foreground">No hay préstamos bajo este filtro</h3>
                            <Button onClick={() => navigate("/loans/new")} className="h-14 px-10 rounded-2xl bg-primary text-white font-black">CREAR PRIMER PRÉSTAMO</Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
                        {filteredLoans.map((loan, index) => {
                            const progress = (loan.paid_amount / loan.total_amount) * 100;
                            return (
                                <motion.div
                                    key={loan.id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="group"
                                >
                                    <Card className="rounded-[3rem] border-none bg-white shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden relative" onClick={() => navigate(`/loans/${loan.id}`)}>
                                        <div className={`h-2 w-full absolute top-0 left-0 bg-gradient-to-r ${loan.status === 'active' ? 'from-emerald-400 to-emerald-600' : 'from-primary to-primary-glow'}`} />
                                        <CardContent className="p-8 space-y-6">
                                            <div className="flex justify-between items-start">
                                                <div className="space-y-1">
                                                    <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">{loan.loan_number}</p>
                                                    <h3 className="text-2xl font-black tracking-tight">{loan.clients?.full_name}</h3>
                                                </div>
                                                <Badge variant="outline" className={`rounded-full px-4 py-1 text-[10px] font-black uppercase tracking-tighter border-2 ${getStatusStyle(loan.status)}`}>
                                                    {getStatusLabel(loan.status)}
                                                </Badge>
                                            </div>

                                            <div className="p-6 rounded-[2rem] bg-secondary/50 space-y-4">
                                                <div className="flex justify-between items-end">
                                                    <p className="text-xs font-bold text-muted-foreground uppercase opacity-60">Saldo Pendiente</p>
                                                    <p className="text-2xl font-black text-primary">{formatCurrency(loan.remaining_amount)}</p>
                                                </div>
                                                <div className="space-y-2">
                                                    <div className="flex justify-between text-[10px] font-black uppercase tracking-tighter">
                                                        <span className="text-emerald-600">Pagado: {Math.round(progress)}%</span>
                                                        <span className="text-muted-foreground">Meta: {formatCurrency(loan.total_amount)}</span>
                                                    </div>
                                                    <div className="h-2 w-full bg-white rounded-full overflow-hidden">
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${progress}%` }}
                                                            className={`h-full ${loan.status === 'defaulted' ? 'bg-rose-500' : 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]'}`}
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between px-2">
                                                <div className="flex gap-4">
                                                    <div className="text-center">
                                                        <p className="text-[9px] font-black uppercase opacity-40">Cuotas</p>
                                                        <p className="font-bold text-sm">{loan.paid_installments}/{loan.installments}</p>
                                                    </div>
                                                    <div className="text-center border-l border-muted pl-4">
                                                        <p className="text-[9px] font-black uppercase opacity-40">Ciclo</p>
                                                        <p className="font-bold text-sm capitalize">{loan.frequency}</p>
                                                    </div>
                                                </div>
                                                <Button size="icon" variant="ghost" className="rounded-xl w-12 h-12 bg-primary/5 text-primary hover:bg-primary hover:text-white transition-all">
                                                    <ChevronRight className="w-6 h-6" />
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default Loans;
