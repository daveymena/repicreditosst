import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calculator,
  DollarSign,
  Percent,
  Clock,
  Calendar,
  Sparkles,
  TrendingUp,
  Info,
  ChevronRight,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { formatCurrency } from "@/lib/utils";

const FIXED_AMOUNTS = [100000, 500000, 1000000, 5000000];
const FIXED_MONTHS = [3, 6, 12, 24];

const Simulator = () => {
  const [amount, setAmount] = useState<number>(1000000);
  const [interest, setInterest] = useState<number>(20);
  const [months, setMonths] = useState<number>(12);
  const [frequency, setFrequency] = useState<string>("monthly");

  const calculateTotal = () => {
    const totalInterest = amount * (interest / 100);
    const totalAmount = amount + totalInterest;
    return {
      totalInterest,
      totalAmount,
      installment: totalAmount / months
    };
  };

  const { totalInterest, totalAmount, installment } = calculateTotal();

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-12 pb-20">
        <div className="text-center space-y-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-black uppercase tracking-widest"
          >
            <Sparkles className="w-4 h-4" /> Laboratorio de Crédito
          </motion.div>
          <h1 className="text-5xl font-black text-foreground">Simulador Inteligente</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Ajusta los valores para encontrar la cuota perfecta. El proceso es visual e instantáneo.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-10">
          {/* Controls Panel */}
          <div className="lg:col-span-3 space-y-10">
            {/* Amount Selection */}
            <div className="space-y-6">
              <div className="flex justify-between items-end">
                <Label className="text-xl font-black flex items-center gap-2">
                  <DollarSign className="w-6 h-6 text-primary" /> Monto del Préstamo
                </Label>
                <span className="text-4xl font-black text-primary transition-all">{formatCurrency(amount)}</span>
              </div>
              <div className="flex flex-wrap gap-3">
                {FIXED_AMOUNTS.map(a => (
                  <button
                    key={a}
                    onClick={() => setAmount(a)}
                    className={`px-6 py-3 rounded-2xl font-black transition-all border-2 ${amount === a ? 'bg-primary text-white border-primary shadow-glow' : 'bg-white border-transparent text-muted-foreground hover:border-primary/30 shadow-sm'}`}
                  >
                    {formatCurrency(a)}
                  </button>
                ))}
              </div>
              <Slider
                value={[amount]}
                onValueChange={([v]) => setAmount(v)}
                max={10000000}
                step={50000}
                className="cursor-pointer"
              />
            </div>

            {/* Interest & Term Grid */}
            <div className="grid md:grid-cols-2 gap-10">
              <div className="space-y-6">
                <div className="flex justify-between items-end">
                  <Label className="text-xl font-black flex items-center gap-2">
                    <Percent className="w-5 h-5 text-primary" /> Interés
                  </Label>
                  <span className="text-3xl font-black text-primary">{interest}%</span>
                </div>
                <Slider
                  value={[interest]}
                  onValueChange={([v]) => setInterest(v)}
                  max={100}
                  step={1}
                  className="cursor-pointer"
                />
                <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10">
                  <p className="text-[10px] font-black uppercase text-primary/60 mb-1">Gasto en intereses</p>
                  <p className="font-black text-primary">+{formatCurrency(totalInterest)}</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex justify-between items-end">
                  <Label className="text-xl font-black flex items-center gap-2">
                    <Clock className="w-5 h-5 text-primary" /> Plazo
                  </Label>
                  <span className="text-3xl font-black text-primary">{months} <small className="text-xs">meses</small></span>
                </div>
                <div className="flex gap-2">
                  {FIXED_MONTHS.map(m => (
                    <button
                      key={m}
                      onClick={() => setMonths(m)}
                      className={`flex-1 py-3 rounded-2xl font-black transition-all border-2 ${months === m ? 'bg-primary text-white border-primary shadow-glow' : 'bg-white border-transparent text-muted-foreground hover:border-primary/30 shadow-sm'}`}
                    >
                      {m}m
                    </button>
                  ))}
                </div>
                <Slider
                  value={[months]}
                  onValueChange={([v]) => setMonths(v)}
                  max={60}
                  min={1}
                  step={1}
                  className="cursor-pointer"
                />
              </div>
            </div>

            <div className="p-8 rounded-[2.5rem] bg-gradient-mesh border border-white/20 glass-card">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-1">
                  <p className="text-sm font-black uppercase tracking-widest text-primary">Frecuencia de Pago</p>
                  <p className="text-muted-foreground text-sm font-medium">Define cada cuanto tiempo cobrarás al cliente</p>
                </div>
                <Select value={frequency} onValueChange={setFrequency}>
                  <SelectTrigger className="w-full md:w-60 h-14 rounded-2xl bg-white/60 border-none font-black text-lg shadow-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Diario</SelectItem>
                    <SelectItem value="weekly">Semanal</SelectItem>
                    <SelectItem value="biweekly">Quincenal</SelectItem>
                    <SelectItem value="monthly">Mensual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Outcome Panel */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="stat-card border-none bg-gradient-to-br from-indigo-900 to-violet-900 text-white relative overflow-hidden h-full flex flex-col justify-between group">
              <div className="absolute top-0 right-0 p-40 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20 group-hover:scale-110 transition-transform duration-700" />

              <CardHeader className="relative z-10 pt-10">
                <p className="text-indigo-300 font-black uppercase text-xs tracking-[0.3em] mb-4 text-center">Plan de Pagos Sugerido</p>
                <div className="text-center space-y-2">
                  <p className="text-6xl font-black tracking-tighter text-white drop-shadow-2xl">{formatCurrency(installment)}</p>
                  <p className="text-indigo-200 font-bold uppercase tracking-widest text-sm italic">VALOR POR CUOTA</p>
                </div>
              </CardHeader>

              <CardContent className="relative z-10 p-10 space-y-8">
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-4 border-b border-white/10">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                        <TrendingUp className="w-4 h-4 text-emerald-400" />
                      </div>
                      <span className="font-bold text-indigo-100">Capital inicial</span>
                    </div>
                    <span className="font-black text-lg">{formatCurrency(amount)}</span>
                  </div>
                  <div className="flex items-center justify-between py-4 border-b border-white/10">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                        <ArrowRight className="w-4 h-4 text-indigo-300" />
                      </div>
                      <span className="font-bold text-indigo-100">Interés aplicado</span>
                    </div>
                    <span className="font-black text-lg text-emerald-400">{interest}%</span>
                  </div>
                  <div className="flex items-center justify-between py-6">
                    <p className="text-sm font-black uppercase text-indigo-300">Total a Devolver</p>
                    <p className="text-3xl font-black text-yellow-400 drop-shadow-glow">{formatCurrency(totalAmount)}</p>
                  </div>
                </div>

                <Button className="w-full h-20 rounded-[2.5rem] bg-white text-indigo-900 hover:bg-indigo-50 font-black text-xl shadow-2xl button-shimmer" onClick={() => (window.location.href = `/loans/new?amount=${amount}&interest=${interest}&months=${months}`)}>
                  DESEMBOLSAR AHORA <ChevronRight className="ml-2 w-6 h-6" />
                </Button>

                <div className="flex items-center justify-center gap-2 pt-4">
                  <Info className="w-4 h-4 text-indigo-300" />
                  <p className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest">Sujeto a aprobación crediticia</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Simulator;
