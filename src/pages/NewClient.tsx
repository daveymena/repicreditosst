import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  Users,
  Save,
  Plus,
  CreditCard,
  DollarSign,
  Heart,
  ChevronDown,
  ChevronRight,
  CheckCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const NewClient = () => {
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [currentSection, setCurrentSection] = useState(1);
  const [formData, setFormData] = useState({
    full_name: "",
    document_type: "CC",
    document_number: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    occupation: "",
    monthly_income: "",
    reference_name: "",
    reference_phone: "",
    reference_relationship: "",
    notes: "",
  });
  const navigate = useNavigate();

  useEffect(() => { if (id) loadClientData(); }, [id]);

  const loadClientData = async () => {
    try {
      const { data, error } = await supabase.from("clients").select("*").eq("id", id).single();
      if (error) throw error;
      if (data) {
        setFormData({
          full_name: data.full_name || "",
          document_type: data.document_type || "CC",
          document_number: data.document_number || "",
          phone: data.phone || "",
          email: data.email || "",
          address: data.address || "",
          city: data.city || "",
          occupation: data.occupation || "",
          monthly_income: data.monthly_income?.toString() || "",
          reference_name: data.reference_name || "",
          reference_phone: data.reference_phone || "",
          reference_relationship: data.reference_relationship || "",
          notes: data.notes || "",
        });
      }
    } catch (e) { toast.error("No se pudo cargar el cliente"); }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.full_name || !formData.phone) {
      toast.error("Nombre y Teléfono son obligatorios");
      return;
    }
    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const payload = {
        user_id: user.id,
        ...formData,
        monthly_income: formData.monthly_income ? parseFloat(formData.monthly_income) : null,
        updated_at: new Date().toISOString(),
      };

      const { error } = id
        ? await supabase.from("clients").update(payload).eq("id", id)
        : await supabase.from("clients").insert(payload);

      if (error) throw error;
      toast.success(id ? "¡Datos actualizados!" : "¡Cliente registrado!");
      navigate("/clients");
    } catch (e: any) {
      toast.error(e.message || "No se pudo guardar");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-10 pb-20">
        {/* Header Visual */}
        <div className="flex items-center gap-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/clients")}
            className="w-14 h-14 rounded-2xl bg-white shadow-sm hover:bg-primary/5 hover:text-primary transition-all"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div className="space-y-1">
            <h1 className="text-4xl font-black text-foreground">{id ? 'Editar Ficha' : 'Nueva Alta de Cliente'}</h1>
            <p className="text-muted-foreground font-bold italic">Expediente digital de deudor</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid md:grid-cols-4 gap-8">
          {/* Quick Navigation / Stepper */}
          <div className="md:col-span-1 space-y-4">
            {[
              { id: 1, label: "Identificación", icon: User },
              { id: 2, label: "Ubicación", icon: MapPin },
              { id: 3, label: "Finanzas", icon: DollarSign },
              { id: 4, label: "Referencia", icon: Heart },
              { id: 5, label: "Notas", icon: Briefcase }
            ].map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setCurrentSection(s.id)}
                className={`w-full flex items-center justify-between p-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${currentSection === s.id ? 'bg-primary text-white shadow-glow' : 'text-muted-foreground hover:bg-primary/5'}`}
              >
                <div className="flex items-center gap-3">
                  <s.icon className="w-4 h-4" /> {s.label}
                </div>
                {currentSection === s.id && <ChevronRight className="w-4 h-4 opacity-50" />}
              </button>
            ))}
          </div>

          {/* Form Sections */}
          <div className="md:col-span-3 space-y-8">
            <AnimatePresence mode="wait">
              {currentSection === 1 && (
                <motion.div key="sec1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                  <Card className="rounded-[2.5rem] border-none glass-card p-10">
                    <CardHeader className="p-0 mb-8">
                      <CardTitle className="text-2xl font-black">Identidad del Cliente</CardTitle>
                      <CardDescription className="font-bold">Información básica y de contacto directo</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0 space-y-6">
                      <div className="space-y-3">
                        <Label className="font-black uppercase tracking-widest text-[10px] text-muted-foreground">Nombre Legal Completo</Label>
                        <Input className="h-16 rounded-2xl bg-secondary/50 border-none px-6 font-bold text-lg" placeholder="Ejem: Juan Alberto Pérez..." value={formData.full_name} onChange={(e) => handleChange("full_name", e.target.value)} />
                      </div>
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <Label className="font-black uppercase tracking-widest text-[10px] text-muted-foreground">Céluda / Identificación</Label>
                          <div className="flex gap-2">
                            <Select value={formData.document_type} onValueChange={(v) => handleChange("document_type", v)}>
                              <SelectTrigger className="w-24 h-14 rounded-2xl bg-secondary/50 border-none font-black">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="CC">CC</SelectItem>
                                <SelectItem value="CE">CE</SelectItem>
                                <SelectItem value="NIT">NIT</SelectItem>
                              </SelectContent>
                            </Select>
                            <Input className="h-14 flex-1 rounded-2xl bg-secondary/50 border-none px-6 font-bold" placeholder="Número..." value={formData.document_number} onChange={(e) => handleChange("document_number", e.target.value)} />
                          </div>
                        </div>
                        <div className="space-y-3">
                          <Label className="font-black uppercase tracking-widest text-[10px] text-muted-foreground">WhatsApp / Móvil</Label>
                          <Input className="h-14 rounded-2xl bg-secondary/50 border-none px-6 font-bold" placeholder="300 --- -- --" value={formData.phone} onChange={(e) => handleChange("phone", e.target.value)} />
                        </div>
                      </div>
                      <div className="space-y-3">
                        <Label className="font-black uppercase tracking-widest text-[10px] text-muted-foreground">Correo Corporativo/Personal</Label>
                        <Input className="h-14 rounded-2xl bg-secondary/50 border-none px-6 font-bold" placeholder="correo@ejemplo.com" value={formData.email} onChange={(e) => handleChange("email", e.target.value)} />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {currentSection === 2 && (
                <motion.div key="sec2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                  <Card className="rounded-[2.5rem] border-none glass-card p-10">
                    <CardHeader className="p-0 mb-8">
                      <CardTitle className="text-2xl font-black">Residencia</CardTitle>
                      <CardDescription className="font-bold">¿Dónde podemos localizar al deudor?</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0 space-y-6">
                      <div className="space-y-3">
                        <Label className="font-black uppercase tracking-widest text-[10px] text-muted-foreground">Dirección Exacta</Label>
                        <Input className="h-16 rounded-2xl bg-secondary/50 border-none px-6 font-bold text-lg" placeholder="Calle, Carrera, Transversal..." value={formData.address} onChange={(e) => handleChange("address", e.target.value)} />
                      </div>
                      <div className="space-y-3">
                        <Label className="font-black uppercase tracking-widest text-[10px] text-muted-foreground">Ciudad / Municipio</Label>
                        <Input className="h-14 rounded-2xl bg-secondary/50 border-none px-6 font-bold" placeholder="Ejem: Medellín..." value={formData.city} onChange={(e) => handleChange("city", e.target.value)} />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {currentSection === 3 && (
                <motion.div key="sec3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                  <Card className="rounded-[2.5rem] border-none glass-card p-10">
                    <CardHeader className="p-0 mb-8">
                      <CardTitle className="text-2xl font-black">Perfil Socioeconómico</CardTitle>
                      <CardDescription className="font-bold">Capacidad real de pago e ingresos</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0 space-y-6">
                      <div className="space-y-3">
                        <Label className="font-black uppercase tracking-widest text-[10px] text-muted-foreground">Ocupación / Labor</Label>
                        <Input className="h-14 rounded-2xl bg-secondary/50 border-none px-6 font-bold" placeholder="Ejem: Comerciante independiente..." value={formData.occupation} onChange={(e) => handleChange("occupation", e.target.value)} />
                      </div>
                      <div className="space-y-3">
                        <Label className="font-black uppercase tracking-widest text-[10px] text-muted-foreground">Ingresos Mensuales Promedio</Label>
                        <div className="relative">
                          <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-primary w-5 h-5" />
                          <Input type="number" className="h-16 pl-12 rounded-2xl bg-secondary/50 border-none px-6 font-black text-2xl" placeholder="0.00" value={formData.monthly_income} onChange={(e) => handleChange("monthly_income", e.target.value)} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {currentSection === 4 && (
                <motion.div key="sec4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                  <Card className="rounded-[2.5rem] border-none glass-card p-10">
                    <CardHeader className="p-0 mb-8">
                      <CardTitle className="text-2xl font-black">Referente de Confianza</CardTitle>
                      <CardDescription className="font-bold">Persona que pueda avalar al cliente o darnos razón</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0 space-y-6">
                      <div className="space-y-3">
                        <Label className="font-black uppercase tracking-widest text-[10px] text-muted-foreground">Nombre de Referencia</Label>
                        <Input className="h-14 rounded-2xl bg-secondary/50 border-none px-6 font-bold" placeholder="Nombre completo..." value={formData.reference_name} onChange={(e) => handleChange("reference_name", e.target.value)} />
                      </div>
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <Label className="font-black uppercase tracking-widest text-[10px] text-muted-foreground">Teléfono Contacto</Label>
                          <Input className="h-14 rounded-2xl bg-secondary/50 border-none px-6 font-bold" placeholder="300 -- --" value={formData.reference_phone} onChange={(e) => handleChange("reference_phone", e.target.value)} />
                        </div>
                        <div className="space-y-3">
                          <Label className="font-black uppercase tracking-widest text-[10px] text-muted-foreground">Parentesco / Vínculo</Label>
                          <Input className="h-14 rounded-2xl bg-secondary/50 border-none px-6 font-bold" placeholder="Ejem: Hermano, Colega..." value={formData.reference_relationship} onChange={(e) => handleChange("reference_relationship", e.target.value)} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {currentSection === 5 && (
                <motion.div key="sec5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                  <Card className="rounded-[2.5rem] border-none glass-card p-10">
                    <CardHeader className="p-0 mb-8">
                      <CardTitle className="text-2xl font-black">Observaciones</CardTitle>
                      <CardDescription className="font-bold">Notas internas sobre el perfil de riesgo o carácter</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0 space-y-6">
                      <Textarea className="min-h-[200px] rounded-2xl bg-secondary/50 border-none px-6 py-4 font-medium" placeholder="Escribe aquí cualquier detalle relevante..." value={formData.notes} onChange={(e) => handleChange("notes", e.target.value)} />
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex justify-between items-center bg-white/50 backdrop-blur-xl p-6 rounded-[2rem] border border-white/20">
              <Button type="button" variant="ghost" className="h-14 rounded-2xl px-8 font-black text-muted-foreground" onClick={() => navigate("/clients")}>DESCARTAR</Button>
              <div className="flex gap-4">
                {currentSection > 1 && <Button type="button" variant="outline" className="h-14 rounded-2xl px-6 border-none bg-muted font-black" onClick={() => setCurrentSection(s => s - 1)}>ATRÁS</Button>}
                {currentSection < 5 ? (
                  <Button type="button" className="h-14 rounded-2xl px-8 bg-black text-white font-black" onClick={() => setCurrentSection(s => s + 1)}>SIGUIENTE <ChevronRight className="ml-2 w-4 h-4" /></Button>
                ) : (
                  <Button type="submit" disabled={isLoading} className="h-14 rounded-2xl px-10 bg-gradient-primary shadow-glow text-white font-black button-shimmer">
                    <Save className="mr-2 w-5 h-5" /> {isLoading ? "GUARDANDO..." : "FINALIZAR REGISTRO"}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default NewClient;
