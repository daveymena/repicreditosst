import { useState } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { User, Phone, Mail, MapPin, Save, CheckCircle, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const ClientOnboarding = () => {
    const { lenderId } = useParams();
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [formData, setFormData] = useState({
        full_name: "",
        phone: "",
        email: "",
        document_number: "",
        address: "",
        city: "",
        occupation: "",
        notes: ""
    });

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!lenderId) {
            toast.error("Link de registro inválido");
            return;
        }

        setIsLoading(true);
        try {
            const { error } = await supabase.from("clients").insert({
                user_id: lenderId,
                full_name: formData.full_name,
                phone: formData.phone,
                email: formData.email || null,
                document_number: formData.document_number || null,
                address: formData.address || null,
                city: formData.city || null,
                occupation: formData.occupation || null,
                notes: `Auto-registro. ${formData.notes || ""}`,
                status: "active"
            });

            if (error) throw error;
            setIsSuccess(true);
            toast.success("¡Datos enviados correctamente!");
        } catch (error: any) {
            console.error("Error onboarding:", error);
            toast.error("Error al enviar tus datos. Por favor contacta al prestamista.");
        } finally {
            setIsLoading(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                    <Card className="max-w-md text-center p-8 border-primary/20 shadow-2xl">
                        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle className="w-10 h-10 text-primary" />
                        </div>
                        <h1 className="text-2xl font-bold mb-2">¡Datos Enviados!</h1>
                        <p className="text-muted-foreground mb-6">
                            Tu información ha sido enviada de forma segura. Tu asesor se pondrá en contacto contigo pronto.
                        </p>
                        <ShieldCheck className="w-5 h-5 text-muted-foreground mx-auto mb-2" />
                        <p className="text-xs text-muted-foreground">Conexión segura y encriptada</p>
                    </Card>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-muted/30 py-12 px-4">
            <div className="max-w-2xl mx-auto space-y-8">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-foreground">Registro de Cliente</h1>
                    <p className="text-muted-foreground">Completa tus datos para iniciar tu proceso con RapiCréditos</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <Card className="shadow-xl">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="w-5 h-5 text-primary" />
                                Información Personal
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="full_name">Nombre Completo *</Label>
                                <Input
                                    id="full_name"
                                    required
                                    value={formData.full_name}
                                    onChange={(e) => handleChange("full_name", e.target.value)}
                                    placeholder="Juan Pérez"
                                />
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Teléfono / WhatsApp *</Label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            id="phone"
                                            required
                                            className="pl-10"
                                            value={formData.phone}
                                            onChange={(e) => handleChange("phone", e.target.value)}
                                            placeholder="300 123 4567"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="doc">Número de Documento</Label>
                                    <Input
                                        id="doc"
                                        value={formData.document_number}
                                        onChange={(e) => handleChange("document_number", e.target.value)}
                                        placeholder="CC / CE / PP"
                                    />
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="city">Ciudad</Label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            id="city"
                                            className="pl-10"
                                            value={formData.city}
                                            onChange={(e) => handleChange("city", e.target.value)}
                                            placeholder="Bogotá"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="occ">Ocupación</Label>
                                    <Input
                                        id="occ"
                                        value={formData.occupation}
                                        onChange={(e) => handleChange("occupation", e.target.value)}
                                        placeholder="Empleado, Independiente..."
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="notes">Notas adicionales</Label>
                                <Textarea
                                    id="notes"
                                    value={formData.notes}
                                    onChange={(e) => handleChange("notes", e.target.value)}
                                    placeholder="Escribe aquí cualquier detalle adicional..."
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-12 text-lg bg-gradient-to-r from-primary to-primary-glow"
                                disabled={isLoading}
                            >
                                {isLoading ? "Enviando..." : "Enviar mis datos"}
                                <Save className="ml-2 w-5 h-5" />
                            </Button>
                        </CardContent>
                    </Card>
                </form>
            </div>
        </div>
    );
};

export default ClientOnboarding;
