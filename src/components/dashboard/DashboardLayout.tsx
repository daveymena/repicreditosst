import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Banknote,
  Calculator,
  MessageSquare,
  User,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  Sparkles,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: Users, label: "Clientes", path: "/clients" },
  { icon: Banknote, label: "Préstamos", path: "/loans" },
  { icon: Calculator, label: "Simulador", path: "/simulator" },
  { icon: MessageSquare, label: "WhatsApp", path: "/whatsapp" },
  { icon: User, label: "Mi Perfil", path: "/profile" },
];

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase.from("profiles").select("*").eq("user_id", user.id).single();
      setProfile(data);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Sesión cerrada");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background bg-gradient-mesh flex">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex flex-col w-72 h-screen sticky top-0 bg-white/50 dark:bg-black/20 backdrop-blur-2xl border-r border-white/20 px-6 py-8 z-50">
        <div className="flex items-center gap-3 mb-12 px-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-glow">
            <Banknote className="text-white w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-foreground">RapiCréditos</h1>
            <p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">SaaS Pro</p>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group ${isActive
                    ? "bg-primary text-white shadow-glow"
                    : "text-muted-foreground hover:bg-white/40 dark:hover:bg-white/5 hover:text-foreground"
                  }`}
              >
                <item.icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${isActive ? "text-white" : "text-muted-foreground group-hover:text-primary"}`} />
                <span className="font-bold text-sm tracking-wide">{item.label}</span>
                {isActive && <ChevronRight className="ml-auto w-4 h-4 text-white/50" />}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto pt-8 border-t border-white/20">
          <div className="bg-white/40 dark:bg-white/5 p-4 rounded-[2rem] border border-white/20 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <Avatar className="w-10 h-10 border-2 border-primary/20">
                <AvatarImage src={profile?.avatar_url} />
                <AvatarFallback className="font-bold bg-primary text-white">{profile?.full_name?.charAt(0) || "U"}</AvatarFallback>
              </Avatar>
              <div className="overflow-hidden">
                <p className="text-xs font-black truncate">{profile?.full_name || "Cargando..."}</p>
                <p className="text-[10px] text-muted-foreground truncate">{profile?.email}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              className="w-full justify-start h-10 rounded-xl text-destructive hover:bg-destructive/10 hover:text-destructive group"
              onClick={handleLogout}
            >
              <LogOut className="mr-3 w-4 h-4 transition-transform group-hover:translate-x-1" />
              <span className="text-xs font-bold uppercase tracking-widest">Cerrar Sesión</span>
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0">
        {/* Top Header */}
        <header className="h-20 lg:h-24 sticky top-0 bg-background/60 backdrop-blur-xl border-b border-white/20 flex items-center justify-between px-6 lg:px-10 z-40">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden rounded-xl"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </Button>
            <div className="hidden md:flex items-center gap-3 bg-white/50 dark:bg-white/5 border border-white/20 px-4 py-2 rounded-2xl w-80">
              <Search className="w-4 h-4 text-muted-foreground" />
              <input
                placeholder="Buscar clientes o cobros..."
                className="bg-transparent border-none outline-none text-sm w-full placeholder:text-muted-foreground/60"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" className="rounded-2xl relative group">
              <Bell className="w-5 h-5 text-muted-foreground" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full animate-pulse" />
            </Button>
            <Link to="/profile">
              <Avatar className="w-10 h-10 border-2 border-primary/10 hover:border-primary/50 transition-all">
                <AvatarImage src={profile?.avatar_url} />
                <AvatarFallback className="font-bold bg-muted">{profile?.full_name?.charAt(0) || "U"}</AvatarFallback>
              </Avatar>
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6 lg:p-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {children}
          </motion.div>
        </div>
      </main>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="w-80 h-full bg-background p-6 flex flex-col pt-20 relative"
              onClick={(e) => e.stopPropagation()}
            >
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-6 right-6 rounded-xl"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <X className="w-6 h-6" />
              </Button>

              <div className="space-y-2">
                {menuItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center gap-4 px-4 py-4 rounded-2xl transition-all ${isActive
                          ? "bg-primary text-white shadow-glow"
                          : "text-muted-foreground active:bg-primary/10"
                        }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <item.icon className="w-6 h-6" />
                      <span className="font-bold">{item.label}</span>
                    </Link>
                  );
                })}
              </div>

              <div className="mt-auto">
                <Button
                  variant="outline"
                  className="w-full justify-start h-14 rounded-2xl text-destructive border-destructive/20 active:bg-destructive/10"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-3 w-5 h-5" />
                  <span className="font-bold">Cerrar Sesión</span>
                </Button>
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DashboardLayout;
