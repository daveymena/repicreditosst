import { motion } from "framer-motion";
import { UserPlus, Calculator, Send, FileCheck } from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    title: "Registra Clientes",
    description: "Añade la información del cliente con sus referencias y datos de contacto.",
    step: "01",
  },
  {
    icon: Calculator,
    title: "Simula el Préstamo",
    description: "Calcula intereses, cuotas y fechas de pago con nuestro simulador inteligente.",
    step: "02",
  },
  {
    icon: Send,
    title: "Envía Recordatorios",
    description: "La IA genera mensajes personalizados y los envías por WhatsApp con un clic.",
    step: "03",
  },
  {
    icon: FileCheck,
    title: "Genera Paz y Salvo",
    description: "Al finalizar el pago, genera automáticamente el certificado profesional.",
    step: "04",
  },
];

const HowItWorks = () => {
  return (
    <section className="py-24 bg-secondary/30">
      <div className="container">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-2 rounded-full bg-accent/20 text-accent-foreground text-sm font-medium mb-4">
            ¿Cómo funciona?
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            4 pasos hacia la
            <span className="text-gradient-gold block mt-2">eficiencia total</span>
          </h2>
        </motion.div>

        <div className="relative">
          {/* Connection Line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-primary via-accent to-primary -translate-y-1/2" />

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                className="relative"
              >
                <div className="bg-card rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 relative z-10">
                  {/* Step Number */}
                  <div className="absolute -top-4 -right-4 w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold shadow-glow">
                    {step.step}
                  </div>

                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                    <step.icon className="w-8 h-8 text-primary" />
                  </div>

                  <h3 className="text-xl font-bold text-foreground mb-3">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
