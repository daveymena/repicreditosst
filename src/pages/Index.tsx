import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Banknote, Sparkles, Shield, TrendingUp, ChevronRight, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background bg-gradient-mesh flex flex-col items-center justify-center p-6 lg:p-10 relative overflow-hidden">
      {/* Abstract Background Shapes */}
      <div className="absolute top-0 right-0 p-96 bg-primary/10 rounded-full blur-[120px] -mr-40 -mt-40 animate-pulse" />
      <div className="absolute bottom-0 left-0 p-96 bg-accent/10 rounded-full blur-[120px] -ml-40 -mb-40" />

      <div className="max-w-4xl w-full space-y-12 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/50 backdrop-blur-md border border-white/20 shadow-xl"
        >
          <Sparkles className="text-primary w-4 h-4" />
          <span className="text-xs font-black uppercase tracking-[0.2em] text-primary">Próxima Generación de Finanzas</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-6"
        >
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-[2rem] bg-gradient-primary flex items-center justify-center shadow-glow">
              <Banknote className="text-white w-8 h-8" />
            </div>
            <h1 className="text-6xl lg:text-8xl font-black tracking-tighter text-foreground decoration-primary decoration-8">
              Rapi<span className="text-primary">Créditos</span>
            </h1>
          </div>
          <h2 className="text-4xl lg:text-5xl font-extrabold text-foreground leading-[1.1] tracking-tight">
            El Software SaaS más potente para <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">gestión de préstamos.</span>
          </h2>
          <p className="text-xl text-muted-foreground font-medium max-w-2xl mx-auto leading-relaxed">
            Automatiza tus cobros, gestiona tus clientes y haz crecer tu capital con tecnología de punta y seguridad bancaria profesional.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-6"
        >
          <Button
            onClick={() => navigate("/register")}
            className="h-20 px-12 rounded-[2.5rem] bg-gradient-primary text-xl font-black shadow-glow button-shimmer min-w-[240px]"
          >
            EMPEZAR AHORA <ChevronRight className="ml-2 w-6 h-6" />
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate("/login")}
            className="h-20 px-12 rounded-[2.5rem] border-2 border-primary/20 bg-white/50 backdrop-blur-md text-xl font-black hover:bg-primary/5 transition-all min-w-[240px]"
          >
            INICIAR SESIÓN
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="pt-12 grid grid-cols-2 md:grid-cols-4 gap-8"
        >
          {[
            { icon: Shield, label: "Seguridad Pro" },
            { icon: Zap, label: "Cálculos IA" },
            { icon: TrendingUp, label: "Escalabilidad" },
            { icon: Sparkles, label: "Diseño Premium" }
          ].map((feature, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                <feature.icon className="w-5 h-5 text-primary" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{feature.label}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default Index;
