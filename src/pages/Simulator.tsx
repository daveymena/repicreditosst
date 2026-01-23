import { useState } from "react";
import { motion } from "framer-motion";
import { Calculator, DollarSign, Calendar, Percent, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

const Simulator = () => {
  const [principal, setPrincipal] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [installments, setInstallments] = useState("");
  const [frequency, setFrequency] = useState("monthly");
  const [result, setResult] = useState<any>(null);

  const calculateLoan = () => {
    const p = parseFloat(principal);
    const r = parseFloat(interestRate) / 100;
    const n = parseInt(installments);

    if (!p || !r || !n) return;

    const totalInterest = p * r * n;
    const totalAmount = p + totalInterest;
    const installmentAmount = totalAmount / n;

    setResult({
      principal: p,
      totalInterest,
      totalAmount,
      installmentAmount,
      installments: n,
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Simulador de Préstamos</h1>
          <p className="text-muted-foreground">Calcula cuotas, intereses y fechas de pago</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Form */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-primary" />
                  Datos del Préstamo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Monto del préstamo</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="number"
                      placeholder="1000000"
                      value={principal}
                      onChange={(e) => setPrincipal(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Tasa de interés (%)</Label>
                  <div className="relative">
                    <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="number"
                      placeholder="10"
                      value={interestRate}
                      onChange={(e) => setInterestRate(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Número de cuotas</Label>
                  <Input
                    type="number"
                    placeholder="12"
                    value={installments}
                    onChange={(e) => setInstallments(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Frecuencia de pago</Label>
                  <Select value={frequency} onValueChange={setFrequency}>
                    <SelectTrigger>
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

                <Button onClick={calculateLoan} className="w-full bg-gradient-primary text-primary-foreground shadow-glow">
                  <TrendingUp className="mr-2 w-5 h-5" />
                  Calcular
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Result */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <Card className={`h-full ${result ? "border-primary/50" : ""}`}>
              <CardHeader>
                <CardTitle>Resultado</CardTitle>
              </CardHeader>
              <CardContent>
                {result ? (
                  <div className="space-y-6">
                    <div className="p-6 rounded-xl bg-gradient-primary text-primary-foreground text-center">
                      <p className="text-sm opacity-80 mb-1">Valor de cada cuota</p>
                      <p className="text-4xl font-bold">{formatCurrency(result.installmentAmount)}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl bg-secondary text-center">
                        <p className="text-sm text-muted-foreground">Capital</p>
                        <p className="text-xl font-bold text-foreground">{formatCurrency(result.principal)}</p>
                      </div>
                      <div className="p-4 rounded-xl bg-secondary text-center">
                        <p className="text-sm text-muted-foreground">Intereses</p>
                        <p className="text-xl font-bold text-accent">{formatCurrency(result.totalInterest)}</p>
                      </div>
                      <div className="p-4 rounded-xl bg-secondary text-center col-span-2">
                        <p className="text-sm text-muted-foreground">Total a pagar</p>
                        <p className="text-2xl font-bold text-foreground">{formatCurrency(result.totalAmount)}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-64 text-center">
                    <Calculator className="w-16 h-16 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Ingresa los datos y presiona calcular</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Simulator;
