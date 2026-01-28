
export interface BotVisualResponse {
    text: string;
    image?: string;
    section?: string;
    actionLabel?: string;
    actionPath?: string;
}

export const APP_SECTIONS_KNOWLEDGE: Record<string, BotVisualResponse> = {
    "prestamos": {
        text: "En la sección de Préstamos puedes crear nuevos créditos, ver el historial y gestionar cobros.",
        image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80&w=400",
        section: "Gestión de Préstamos",
        actionLabel: "Ir a Préstamos",
        actionPath: "/loans"
    },
    "clientes": {
        text: "Aquí puedes registrar a tus clientes, ver sus perfiles y descargar su historial de crédito.",
        image: "https://images.unsplash.com/photo-1556742044-3c52d6e88c62?auto=format&fit=crop&q=80&w=400",
        section: "Directorio de Clientes",
        actionLabel: "Ver Clientes",
        actionPath: "/clients"
    },
    "pagos": {
        text: "Registra abonos fácilmente desde el detalle de cada préstamo. Genera recibos PDF al instante.",
        image: "https://images.unsplash.com/photo-1580519542036-c47de6196ba5?auto=format&fit=crop&q=80&w=400",
        section: "Control de Pagos",
        actionLabel: "Registrar Pago",
        actionPath: "/loans"
    },
    "configuracion": {
        text: "Ajusta tus tasas de interés predeterminadas y personaliza los recibos de tu negocio.",
        image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=400",
        section: "Configuración",
        actionLabel: "Ajustes",
        actionPath: "/settings"
    }
};

export const getQuickResponse = (query: string): BotVisualResponse | null => {
    const q = query.toLowerCase();
    if (q.includes("prestamo") || q.includes("crédito")) return APP_SECTIONS_KNOWLEDGE["prestamos"];
    if (q.includes("cliente")) return APP_SECTIONS_KNOWLEDGE["clientes"];
    if (q.includes("pago") || q.includes("abono") || q.includes("recibo")) return APP_SECTIONS_KNOWLEDGE["pagos"];
    if (q.includes("ajuste") || q.includes("mi negocio") || q.includes("config")) return APP_SECTIONS_KNOWLEDGE["configuracion"];
    return null;
};
