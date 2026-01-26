import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  DollarSign,
  Users,
  TrendingUp,
  AlertTriangle,
  PlusCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Banknote
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Stats {
  totalCapital: number;
  totalClients: number;
  activeLoans: number;
  overdueLoans: number;
  totalEarnings: number;
  pendingPayments: number;
}

const Dashboard = () => {
  const [stats, setStats] = useState<Stats>({
    totalCapital: 0,
    totalClients: 0,
    activeLoans: 0,
    overdueLoans: 0,
    totalEarnings: 0,
    pendingPayments: 0,
  });
  const [recentLoans, setRecentLoans] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login");
        return;
      }

      // Load stats
      const [clientsRes, loansRes] = await Promise.all([
        supabase.from("clients").select("*", { count: "exact" }).eq("user_id", user.id),
        supabase.from("loans").select("*").eq("user_id", user.id),
      ]);

      const loans = loansRes.data || [];
      const activeLoans = loans.filter(l => l.status === "active");
      const overdueLoans = loans.filter(l => l.status === "defaulted");

      setStats({
        totalCapital: activeLoans.reduce((sum, l) => sum + Number(l.remaining_amount || 0), 0),
        totalClients: clientsRes.count || 0,
        activeLoans: activeLoans.length,
        overdueLoans: overdueLoans.length,
        totalEarnings: loans.reduce((sum, l) => sum + Number(l.paid_amount || 0), 0),
        pendingPayments: activeLoans.reduce((sum, l) => sum + Number(l.remaining_amount || 0), 0),
      });

      // Recent loans
      const { data: recent } = await supabase
        .from("loans")
        .select(`
          *,
          clients (full_name, phone)
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5);

      setRecentLoans(recent || []);
    } catch (error) {
      console.error("Error loading dashboard:", error);
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

  const statCards = [
    {
      title: "Capital en la Calle",
      value: formatCurrency(stats.totalCapital),
      icon: DollarSign,
      trend: "+12%",
      trendUp: true,
      color: "from-primary to-primary-glow",
    },
    {
      title: "Total Clientes",
      value: stats.totalClients.toString(),
      icon: Users,
      trend: "+3",
      trendUp: true,
      color: "from-accent to-warning",
    },
    {
      title: "Préstamos Activos",
      value: stats.activeLoans.toString(),
      icon: TrendingUp,
      trend: stats.activeLoans > 0 ? "Activos" : "Sin préstamos",
      trendUp: true,
      color: "from-success to-primary",
    },
    {
      title: "En Mora",
      value: stats.overdueLoans.toString(),
      icon: AlertTriangle,
      trend: stats.overdueLoans > 0 ? "Atención" : "Todo al día",
      trendUp: stats.overdueLoans === 0,
      color: "from-destructive to-warning",
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">Resumen de tu cartera de préstamos</p>
          </div>
          <Button
            onClick={() => navigate("/loans/new")}
            className="bg-gradient-primary hover:opacity-90 text-primary-foreground shadow-glow"
          >
            <PlusCircle className="mr-2 w-5 h-5" />
            Nuevo Préstamo
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="stat-card border-none relative overflow-hidden group">
                <div className={`absolute top-0 right-0 p-16 rounded-full blur-3xl opacity-10 -mr-8 -mt-8 transition-opacity group-hover:opacity-20 bg-gradient-to-br ${stat.color}`} />
                <CardContent className="pt-6 relative z-10">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{stat.title}</p>
                      <p className="text-3xl font-black text-foreground">{stat.value}</p>
                    </div>
                    <div className={`w-14 h-14 rounded-[1.25rem] bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-glow shadow-primary/20`}>
                      <stat.icon className="w-7 h-7 text-white" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-6">
                    <div className={`flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-bold ${stat.trendUp ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>
                      {stat.trendUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                      {stat.trend}
                    </div>
                    <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">vs mes anterior</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Main Content Area */}
        <div className="grid lg:grid-cols-5 gap-8">
          {/* Quick Actions Panel */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xl font-black text-foreground flex items-center gap-3 px-2">
              <Sparkles className="text-primary w-6 h-6" /> Acciones Rápidas
            </h2>
            <div className="grid gap-4">
              <Button
                variant="outline"
                className="h-24 justify-start p-6 rounded-[2rem] border-2 border-primary/20 bg-primary/5 hover:bg-primary/10 hover:border-primary transition-all group overflow-hidden relative"
                onClick={async () => {
                  const { data: { user } } = await supabase.auth.getUser();
                  if (user) {
                    const link = `${window.location.origin}/unirme/${user.id}`;
                    navigator.clipboard.writeText(link);
                    toast.success("¡Link de registro copiado!");
                  }
                }}
              >
                <div className="absolute top-0 right-0 p-8 bg-primary/10 rounded-full blur-2xl -mr-4 -mt-4 group-hover:bg-primary/20 transition-colors" />
                <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-glow shrink-0 z-10">
                  <PlusCircle className="text-white w-6 h-6" />
                </div>
                <div className="text-left ml-4 z-10">
                  <p className="font-black text-primary text-lg">Vincular Clientes</p>
                  <p className="text-xs text-primary/60 font-bold uppercase tracking-widest">Compartir Link de Registro</p>
                </div>
              </Button>

              <div className="grid grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  className="h-28 flex-col items-start gap-2 p-6 rounded-[2rem] hover:border-primary transition-all group"
                  onClick={() => navigate("/loans/new")}
                >
                  <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center group-hover:bg-accent group-hover:text-white transition-all text-accent">
                    <Banknote className="w-5 h-5" />
                  </div>
                  <span className="font-black text-foreground">Nuevo Crédito</span>
                </Button>

                <Button
                  variant="outline"
                  className="h-28 flex-col items-start gap-2 p-6 rounded-[2rem] hover:border-primary transition-all group"
                  onClick={() => navigate("/clients/new")}
                >
                  <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center group-hover:bg-success group-hover:text-white transition-all text-success">
                    <Users className="w-5 h-5" />
                  </div>
                  <span className="font-black text-foreground">Crear Cliente</span>
                </Button>
              </div>

              <Button
                variant="outline"
                className="h-20 justify-start p-6 rounded-[2rem] hover:border-primary transition-all group"
                onClick={() => navigate("/simulator")}
              >
                <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center group-hover:bg-violet-600 group-hover:text-white transition-all text-violet-600">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div className="text-left ml-4">
                  <p className="font-bold text-foreground">Simulador Pro</p>
                  <p className="text-[10px] text-muted-foreground font-bold tracking-tighter">CÁLCULO DE CUOTAS Y PAGOS</p>
                </div>
              </Button>
            </div>
          </div>

          {/* Activity Panel */}
          <div className="lg:col-span-3 space-y-6">
            <h2 className="text-xl font-black text-foreground flex items-center gap-3 px-2">
              <Clock className="text-primary w-6 h-6" /> Actividad Reciente
            </h2>
            <Card className="glass-card border-none rounded-[2.5rem] overflow-hidden">
              <CardContent className="p-4">
                {isLoading ? (
                  <div className="flex items-center justify-center py-20">
                    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : recentLoans.length === 0 ? (
                  <div className="text-center py-20">
                    <div className="w-20 h-20 rounded-[2.5rem] bg-muted mx-auto mb-6 flex items-center justify-center">
                      <Clock className="w-10 h-10 text-muted-foreground/40" />
                    </div>
                    <p className="text-lg font-bold text-muted-foreground">No hay préstamos aún</p>
                    <Button variant="link" className="text-primary font-bold" onClick={() => navigate("/loans/new")}>Inicia creando uno aquí</Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {recentLoans.map((loan, index) => (
                      <motion.div
                        key={loan.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center justify-between p-5 rounded-[2rem] hover:bg-white/60 dark:hover:bg-white/5 transition-all cursor-pointer group"
                        onClick={() => navigate(`/loans/${loan.id}`)}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <span className="text-xl font-black text-primary">{loan.clients?.full_name?.charAt(0)}</span>
                          </div>
                          <div>
                            <p className="font-black text-foreground">{loan.clients?.full_name}</p>
                            <p className="text-xs font-bold text-muted-foreground tracking-widest">{loan.loan_number}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-black text-foreground text-lg">{formatCurrency(loan.total_amount)}</p>
                          <Badge variant="outline" className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest border-2 ${loan.status === "active" ? "border-emerald-500/20 text-emerald-500 bg-emerald-500/5" :
                            loan.status === "completed" ? "border-primary-glow/20 text-primary-glow bg-primary-glow/5" :
                              "border-rose-500/20 text-rose-500 bg-rose-500/5"
                            }`}>
                            {loan.status === "active" ? "Activo" : loan.status === "completed" ? "Pagado" : "En mora"}
                          </Badge>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
