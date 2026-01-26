import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Plus,
  Phone,
  Mail,
  MapPin,
  MoreVertical,
  Users as UsersIcon,
  Filter,
  CreditCard,
  ChevronRight,
  TrendingUp,
  MessageSquare,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Client {
  id: string;
  full_name: string;
  document_number: string;
  phone: string;
  email: string;
  city: string;
  status: string;
  created_at: string;
}

const Clients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate("/login"); return; }
      const { data, error } = await supabase.from("clients").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
      if (error) throw error;
      setClients(data || []);
    } catch (error: any) {
      toast.error("Error cargando clientes");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredClients = clients.filter(client =>
    client.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone.includes(searchTerm) ||
    client.document_number?.includes(searchTerm)
  );

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "active": return { label: "Al día", class: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" };
      case "inactive": return { label: "Inactivo", class: "bg-slate-500/10 text-slate-600 border-slate-500/20" };
      case "blacklisted": return { label: "Mora Crítica", class: "bg-rose-500/10 text-rose-600 border-rose-500/20" };
      default: return { label: status, class: "bg-muted" };
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-10 pb-20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
          <div className="space-y-1">
            <h1 className="text-4xl font-black text-foreground tracking-tight">Cartera de Clientes</h1>
            <p className="text-muted-foreground font-bold flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" /> {clients.length} contactos registrados bajo tu gestión
            </p>
          </div>
          <Button
            onClick={() => navigate("/clients/new")}
            className="h-16 px-8 rounded-[2rem] bg-gradient-primary text-lg font-black shadow-glow button-shimmer"
          >
            <Plus className="mr-2 w-6 h-6" /> NUEVO CLIENTE
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 px-2">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary" />
            <input
              placeholder="Escribe para buscar (Nombre, ID o Teléfono)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-16 pl-12 pr-4 bg-white/50 border-none rounded-[1.5rem] font-bold text-foreground placeholder:text-muted-foreground placeholder:font-medium shadow-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none"
            />
          </div>
          <Button variant="outline" className="h-16 rounded-[1.5rem] bg-white border-none shadow-sm px-8 font-black uppercase text-xs tracking-widest gap-2">
            <Filter className="w-4 h-4" /> Filtros Avanzados
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-40">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredClients.length === 0 ? (
          <Card className="py-32 rounded-[3.5rem] glass-card border-none">
            <CardContent className="text-center space-y-6">
              <div className="w-24 h-24 rounded-[2.5rem] bg-primary/5 flex items-center justify-center mx-auto">
                <UsersIcon className="w-12 h-12 text-primary/30" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-foreground">Sin coincidencias</h3>
                <p className="text-muted-foreground font-medium max-w-sm mx-auto">
                  No encontramos clientes con esos datos. ¿Quieres registrar uno nuevo ahora mismo?
                </p>
              </div>
              <Button
                onClick={() => navigate("/clients/new")}
                className="rounded-2xl h-14 px-8 font-black bg-primary text-white"
              >
                REGISTRAR PRIMER CLIENTE
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
            {filteredClients.map((client, index) => {
              const status = getStatusConfig(client.status);
              return (
                <motion.div
                  key={client.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, type: 'spring', stiffness: 50 }}
                >
                  <Card
                    className="group border-none rounded-[2.5rem] bg-white shadow-sm hover:shadow-2xl transition-all duration-500 cursor-pointer relative overflow-hidden h-full flex flex-col"
                    onClick={() => navigate(`/clients/${client.id}`)}
                  >
                    <div className="absolute top-0 right-0 p-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-primary/10 transition-colors" />

                    <CardContent className="p-8 space-y-6 relative z-10 flex-1 flex flex-col">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 rounded-[1.75rem] bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center border-4 border-white shadow-sm">
                            <span className="text-2xl font-black text-primary">
                              {client.full_name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <h3 className="text-xl font-black text-foreground tracking-tight group-hover:text-primary transition-colors">
                              {client.full_name}
                            </h3>
                            <Badge variant="outline" className={`mt-1 rounded-full px-3 text-[9px] font-black uppercase tracking-tighter border-2 ${status.class}`}>
                              {status.label}
                            </Badge>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-muted">
                              <MoreVertical className="w-5 h-5 text-muted-foreground" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="rounded-2xl p-2 border-none shadow-xl">
                            <DropdownMenuItem className="rounded-xl font-bold py-3" onClick={(e) => { e.stopPropagation(); navigate(`/clients/${client.id}`); }}>Ver Detalles</DropdownMenuItem>
                            <DropdownMenuItem className="rounded-xl font-bold py-3 text-primary" onClick={(e) => { e.stopPropagation(); navigate(`/loans/new?clientId=${client.id}`); }}>Nuevo Crédito</DropdownMenuItem>
                            <DropdownMenuItem className="rounded-xl font-bold py-3 text-destructive" onClick={(e) => e.stopPropagation()}>Inhabilitar</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <div className="grid grid-cols-2 gap-4 py-4">
                        <div className="p-4 rounded-2xl bg-secondary/50 space-y-1">
                          <p className="text-[10px] font-black text-muted-foreground uppercase opacity-60">Teléfono</p>
                          <p className="font-bold text-foreground text-sm flex items-center gap-2"><Phone className="w-3 h-3 text-primary" /> {client.phone}</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-secondary/50 space-y-1">
                          <p className="text-[10px] font-black text-muted-foreground uppercase opacity-60">ID Documento</p>
                          <p className="font-bold text-foreground text-sm flex items-center gap-2"><CreditCard className="w-3 h-3 text-primary" /> {client.document_number || 'N/A'}</p>
                        </div>
                      </div>

                      <div className="mt-auto pt-6 flex items-center justify-between border-t border-muted">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-emerald-500" />
                          <span className="text-xs font-black uppercase text-emerald-600 tracking-tighter">Historial Limpio</span>
                        </div>
                        <Button variant="ghost" className="rounded-full px-4 text-xs font-black uppercase tracking-widest text-primary hover:bg-primary/5 group/btn">
                          Ficha <ChevronRight className="ml-1 w-3 h-3 group-hover/btn:translate-x-1 transition-transform" />
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

export default Clients;
