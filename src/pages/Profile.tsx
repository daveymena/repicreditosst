import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    User,
    Mail,
    Phone,
    MapPin,
    Building2,
    Save,
    Camera,
    Loader2,
    CheckCircle,
    AlertCircle,
    MessageSquare,
    Shield,
    Bell,
    DollarSign,
    Percent,
    Sparkles,
    Globe,
    ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ProfileData {
    full_name: string;
    email: string;
    phone: string;
    address: string;
    business_name: string;
    avatar_url: string;
    whatsapp_connected: boolean;
    currency: string;
    default_interest_rate: number;
    late_fee_policy: string;
}

const Profile = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [profileData, setProfileData] = useState<ProfileData>({
        full_name: "",
        email: "",
        phone: "",
        address: "",
        business_name: "",
        avatar_url: "",
        whatsapp_connected: false,
        currency: "COP",
        default_interest_rate: 20,
        late_fee_policy: "Los pagos atrasados generan un cargo adicional del 5% sobre el valor de la cuota.",
    });

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) { navigate("/login"); return; }

            const { data: profile, error } = await supabase.from("profiles").select("*").eq("user_id", user.id).single();

            if (profile) {
                const data = profile as any;
                setProfileData({
                    full_name: data.full_name || "",
                    email: data.email || user.email || "",
                    phone: data.phone || "",
                    address: data.address || "",
                    business_name: data.business_name || "",
                    avatar_url: data.avatar_url || "",
                    whatsapp_connected: data.whatsapp_connected || false,
                    currency: data.currency || "COP",
                    default_interest_rate: data.default_interest_rate || 20,
                    late_fee_policy: data.late_fee_policy || "Los pagos atrasados generan un cargo adicional del 5% sobre el valor de la cuota.",
                });
            } else {
                setProfileData(prev => ({ ...prev, email: user.email || "" }));
            }
        } catch (error) {
            toast.error("Error al cargar el perfil");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        if (!profileData.full_name) {
            toast.error("El nombre completo es requerido");
            return;
        }

        setIsSaving(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: existingProfile } = await supabase.from("profiles").select("id").eq("user_id", user.id).single();

            const payload = {
                user_id: user.id,
                full_name: profileData.full_name,
                email: profileData.email,
                phone: profileData.phone || null,
                address: profileData.address || null,
                business_name: profileData.business_name || null,
                avatar_url: profileData.avatar_url || null,
                whatsapp_connected: profileData.whatsapp_connected,
                currency: profileData.currency,
                default_interest_rate: Number(profileData.default_interest_rate),
                late_fee_policy: profileData.late_fee_policy,
                updated_at: new Date().toISOString(),
            };

            const { error } = existingProfile
                ? await supabase.from("profiles").update(payload).eq("user_id", user.id)
                : await supabase.from("profiles").insert([payload]);

            if (error) throw error;
            toast.success("¡Configuración guardada!");
            loadProfile();
        } catch (error: any) {
            toast.error("Error al guardar: " + error.message);
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return <DashboardLayout><div className="flex items-center justify-center h-96"><Loader2 className="w-12 h-12 animate-spin text-primary" /></div></DashboardLayout>;
    }

    return (
        <DashboardLayout>
            <div className="max-w-6xl mx-auto space-y-12 pb-20">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4">
                    <div className="space-y-2">
                        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest">
                            <Shield className="w-3 h-3" /> Cuenta Corporativa Verificada
                        </motion.div>
                        <h1 className="text-5xl font-black text-foreground tracking-tight">Configuración</h1>
                        <p className="text-muted-foreground font-bold">Personaliza tu identidad y las reglas de tu negocio</p>
                    </div>
                    <Button onClick={handleSave} disabled={isSaving} className="h-16 px-10 rounded-[2rem] bg-gradient-primary shadow-glow text-lg font-black button-shimmer">
                        {isSaving ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-5 h-5 mr-3" />}
                        GUARDAR CAMBIOS
                    </Button>
                </div>

                <div className="grid lg:grid-cols-4 gap-8">
                    {/* Left Panel: Profile Visual */}
                    <div className="lg:col-span-1 space-y-8">
                        <Card className="rounded-[2.5rem] border-none glass-card p-8 text-center relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-24 bg-primary/10 rounded-full blur-3xl -mr-12 -mt-12" />
                            <CardContent className="p-0 space-y-6 relative z-10">
                                <div className="relative inline-block group/avatar">
                                    <Avatar className="w-32 h-32 border-8 border-white shadow-xl mx-auto ring-4 ring-primary/10 transition-transform duration-500 group-hover/avatar:scale-105">
                                        <AvatarImage src={profileData.avatar_url} />
                                        <AvatarFallback className="text-4xl bg-gradient-primary text-white font-black">
                                            {profileData.full_name?.charAt(0) || "U"}
                                        </AvatarFallback>
                                    </Avatar>
                                    <Button size="icon" className="absolute bottom-1 right-1 w-10 h-10 rounded-xl bg-white text-primary shadow-lg border-2 border-primary/20 hover:bg-primary hover:text-white transition-all">
                                        <Camera className="w-5 h-5" />
                                    </Button>
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-2xl font-black text-foreground">{profileData.business_name || "Mi Negocio"}</h3>
                                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Administrador Pro</p>
                                </div>
                                <div className="pt-6 grid grid-cols-2 gap-2 text-left">
                                    <div className="bg-white/50 p-3 rounded-2xl border border-white/20">
                                        <p className="text-[8px] font-black text-muted-foreground uppercase">Capital</p>
                                        <p className="font-bold text-sm tracking-tight text-primary">{profileData.currency}</p>
                                    </div>
                                    <div className="bg-white/50 p-3 rounded-2xl border border-white/20">
                                        <p className="text-[8px] font-black text-muted-foreground uppercase">Tasa Base</p>
                                        <p className="font-bold text-sm tracking-tight text-primary">{profileData.default_interest_rate}%</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Integration Quick Status */}
                        <div className="space-y-4 px-2">
                            <div className="flex items-center justify-between p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white">
                                        <MessageSquare className="w-4 h-4" />
                                    </div>
                                    <span className="text-xs font-black uppercase text-emerald-600">WhatsApp Bot</span>
                                </div>
                                <Switch checked={profileData.whatsapp_connected} />
                            </div>
                            <div className="flex items-center justify-between p-4 rounded-2xl bg-accent/5 border border-accent/10 opacity-50">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-white">
                                        <Globe className="w-4 h-4" />
                                    </div>
                                    <span className="text-xs font-black uppercase text-accent-foreground">API Sync</span>
                                </div>
                                <Switch disabled />
                            </div>
                        </div>
                    </div>

                    {/* Right Panel: Forms */}
                    <div className="lg:col-span-3 space-y-8">
                        {/* Personal/Business Info */}
                        <Card className="rounded-[3rem] border-none glass-card p-10">
                            <CardHeader className="p-0 mb-8">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                                        <Sparkles className="text-primary w-6 h-6" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-2xl font-black">Información del Prestamista</CardTitle>
                                        <CardDescription className="font-bold">Define cómo aparecerás ante tus clientes</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0 space-y-8">
                                <div className="grid md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <Label className="font-black uppercase tracking-widest text-[10px] text-muted-foreground">Nombre del Administrador</Label>
                                        <Input className="h-14 rounded-2xl bg-secondary/50 border-none px-6 font-bold" value={profileData.full_name} onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })} />
                                    </div>
                                    <div className="space-y-3">
                                        <Label className="font-black uppercase tracking-widest text-[10px] text-muted-foreground">Nombre Comercial (Logo)</Label>
                                        <Input className="h-14 rounded-2xl bg-secondary/50 border-none px-6 font-bold" value={profileData.business_name} onChange={(e) => setProfileData({ ...profileData, business_name: e.target.value })} placeholder="Ejem: RapiCréditos Medellín..." />
                                    </div>
                                    <div className="space-y-3">
                                        <Label className="font-black uppercase tracking-widest text-[10px] text-muted-foreground">Correo de Operaciones</Label>
                                        <Input disabled className="h-14 rounded-2xl bg-muted border-none px-6 font-bold opacity-60" value={profileData.email} />
                                    </div>
                                    <div className="space-y-3">
                                        <Label className="font-black uppercase tracking-widest text-[10px] text-muted-foreground">Contacto Oficial</Label>
                                        <Input className="h-14 rounded-2xl bg-secondary/50 border-none px-6 font-bold" value={profileData.phone} onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })} />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <Label className="font-black uppercase tracking-widest text-[10px] text-muted-foreground">Sede de Operaciones</Label>
                                    <Input className="h-14 rounded-2xl bg-secondary/50 border-none px-6 font-bold" value={profileData.address} onChange={(e) => setProfileData({ ...profileData, address: e.target.value })} />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Defaults & Policy */}
                        <Card className="rounded-[3rem] border-none glass-card p-10 bg-gradient-to-br from-white/80 to-primary/5">
                            <CardHeader className="p-0 mb-8">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center">
                                        <Percent className="text-accent w-6 h-6" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-2xl font-black">Reglas de Negocio</CardTitle>
                                        <CardDescription className="font-bold">Parámetros automáticos para nuevas solicitudes</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0 space-y-8">
                                <div className="grid md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <Label className="font-black uppercase tracking-widest text-[10px] text-muted-foreground">Moneda del Sistema</Label>
                                        <Input className="h-14 rounded-2xl bg-secondary/50 border-none px-6 font-black text-primary text-lg" value={profileData.currency} onChange={(e) => setProfileData({ ...profileData, currency: e.target.value })} placeholder="COP, USD, MXN..." />
                                    </div>
                                    <div className="space-y-3">
                                        <Label className="font-black uppercase tracking-widest text-[10px] text-muted-foreground">Interés Base (%)</Label>
                                        <Input type="number" className="h-14 rounded-2xl bg-secondary/50 border-none px-6 font-black text-primary text-xl" value={profileData.default_interest_rate} onChange={(e) => setProfileData({ ...profileData, default_interest_rate: Number(e.target.value) })} />
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <Label className="font-black uppercase tracking-widest text-[10px] text-muted-foreground">Política de Mora (Advertencia Cliente)</Label>
                                        <div className="flex items-center gap-1 text-rose-500 animate-pulse">
                                            <AlertCircle className="w-3 h-3" />
                                            <span className="text-[10px] font-black italic uppercase">Visible en Link Web</span>
                                        </div>
                                    </div>
                                    <Textarea className="min-h-[120px] rounded-[2rem] bg-secondary/50 border-none px-8 py-6 font-medium italic text-muted-foreground" value={profileData.late_fee_policy} onChange={(e) => setProfileData({ ...profileData, late_fee_policy: e.target.value })} />
                                </div>
                            </CardContent>
                        </Card>

                        <div className="flex justify-end pt-4">
                            <Button variant="ghost" className="rounded-2xl h-14 px-8 font-black text-muted-foreground hover:bg-rose-500/5 hover:text-rose-500 transition-colors">
                                ELIMINAR CUENTA Y DATOS
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default Profile;
