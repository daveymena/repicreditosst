import { motion } from "framer-motion";
import { Brain, MessageCircle, FileText, Calculator, BarChart3, Shield } from "lucide-react";
import aiFeature from "@/assets/ai-feature.jpg";
import whatsappFeature from "@/assets/whatsapp-feature.jpg";
import documentsFeature from "@/assets/documents-feature.jpg";

const features = [
  {
    icon: Brain,
    title: "Cerebro con IA",
    description: "Genera mensajes de cobro persuasivos y recordatorios personalizados automáticamente.",
    image: aiFeature,
    color: "from-primary to-primary-glow",
  },
  {
    icon: MessageCircle,
    title: "WhatsApp Directo",
    description: "Conecta tu teléfono y envía recordatorios con un solo clic desde la app.",
    image: whatsappFeature,
    color: "from-success to-primary",
  },
  {
    icon: FileText,
    title: "Documentos Pro",
    description: "Genera recibos PDF y certificados de Paz y Salvo automáticamente.",
    image: documentsFeature,
    color: "from-accent to-warning",
  },
];

const additionalFeatures = [
  {
    icon: Calculator,
    title: "Simulador de Préstamos",
    description: "Calcula intereses, cuotas y fechas según la frecuencia de pago.",
  },
  {
    icon: BarChart3,
    title: "Dashboard Inteligente",
    description: "Visualiza capital en la calle, clientes en mora y balance de ganancias.",
  },
  {
    icon: Shield,
    title: "Datos Seguros",
    description: "Base de datos profesional con encriptación de nivel empresarial.",
  },
];

const Features = () => {
  return (
    <section id="features" className="py-24 bg-background">
      <div className="container">
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Superpoderes
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Todo lo que necesitas para
            <span className="text-gradient-primary block mt-2">cobrar más rápido</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Herramientas profesionales que automatizan tu trabajo y multiplican tu productividad.
          </p>
        </motion.div>

        {/* Main Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="feature-card group"
            >
              <div className="relative h-48 mb-6 rounded-xl overflow-hidden">
                <img 
                  src={feature.image} 
                  alt={feature.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className={`absolute inset-0 bg-gradient-to-t ${feature.color} opacity-20`} />
              </div>
              
              <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} mb-4`}>
                <feature.icon className="w-7 h-7 text-primary-foreground" />
              </div>
              
              <h3 className="text-xl font-bold text-foreground mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Additional Features */}
        <div className="grid md:grid-cols-3 gap-6">
          {additionalFeatures.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="flex items-start gap-4 p-6 rounded-2xl bg-card border border-border hover:shadow-lg transition-all duration-300"
            >
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-1">{feature.title}</h4>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
