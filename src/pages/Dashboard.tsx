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
  ArrowDownRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";

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
              <Card className="stat-card overflow-hidden">
                <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${stat.color}`} />
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                      <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    </div>
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                      <stat.icon className="w-6 h-6 text-primary-foreground" />
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mt-4">
                    {stat.trendUp ? (
                      <ArrowUpRight className="w-4 h-4 text-success" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4 text-destructive" />
                    )}
                    <span className={`text-sm ${stat.trendUp ? "text-success" : "text-destructive"}`}>
                      {stat.trend}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent Loans */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Préstamos Recientes</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate("/loans")}>
                Ver todos
              </Button>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : recentLoans.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No hay préstamos registrados</p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => navigate("/loans/new")}
                  >
                    Crear primer préstamo
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentLoans.map((loan, index) => (
                    <motion.div
                      key={loan.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-4 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors cursor-pointer"
                      onClick={() => navigate(`/loans/${loan.id}`)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Users className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{loan.clients?.full_name}</p>
                          <p className="text-sm text-muted-foreground">{loan.loan_number}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-foreground">{formatCurrency(loan.total_amount)}</p>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          loan.status === "active" ? "bg-success/20 text-success" :
                          loan.status === "completed" ? "bg-primary/20 text-primary" :
                          "bg-destructive/20 text-destructive"
                        }`}>
                          {loan.status === "active" ? "Activo" : 
                           loan.status === "completed" ? "Pagado" : "En mora"}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Acciones Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                variant="outline" 
                className="w-full justify-start h-14 hover:bg-primary/5 hover:border-primary"
                onClick={() => navigate("/clients/new")}
              >
                <Users className="mr-3 w-5 h-5 text-primary" />
                <div className="text-left">
                  <p className="font-medium">Nuevo Cliente</p>
                  <p className="text-xs text-muted-foreground">Registrar un cliente nuevo</p>
                </div>
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start h-14 hover:bg-primary/5 hover:border-primary"
                onClick={() => navigate("/loans/new")}
              >
                <DollarSign className="mr-3 w-5 h-5 text-primary" />
                <div className="text-left">
                  <p className="font-medium">Nuevo Préstamo</p>
                  <p className="text-xs text-muted-foreground">Crear un préstamo nuevo</p>
                </div>
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start h-14 hover:bg-primary/5 hover:border-primary"
                onClick={() => navigate("/simulator")}
              >
                <TrendingUp className="mr-3 w-5 h-5 text-primary" />
                <div className="text-left">
                  <p className="font-medium">Simulador</p>
                  <p className="text-xs text-muted-foreground">Calcular cuotas y fechas</p>
                </div>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
