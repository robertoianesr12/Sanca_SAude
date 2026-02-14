import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Activity, CheckCircle, TrendingUp, Zap, DollarSign, LogOut } from "lucide-react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { showError, showSuccess } from "@/utils/toast";

const ClinicAdmin = () => {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [metrics, setMetrics] = useState({
    faturamentoPrevisto: 0,
    conversaoIA: 0,
    receitaRecuperada: 0
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('appointments')
      .select('*, services(name, price), clients(name, phone)')
      .order('appointment_date', { ascending: true });

    if (error) {
      showError("Erro ao carregar dados.");
    } else {
      setAppointments(data || []);
      calculateMetrics(data || []);
    }
    setLoading(false);
  };

  const calculateMetrics = (data: any[]) => {
    const totalRevenue = data.reduce((acc, curr) => acc + (curr.services?.price || 0), 0);
    const iaAppointments = data.filter(a => a.notes?.source === 'ia_webhook');
    const iaRevenue = iaAppointments.reduce((acc, curr) => acc + (curr.services?.price || 0), 0);
    const conversionRate = data.length > 0 ? (iaAppointments.length / data.length) * 100 : 0;

    setMetrics({
      faturamentoPrevisto: totalRevenue,
      conversaoIA: Math.round(conversionRate),
      receitaRecuperada: iaRevenue
    });
  };

  const confirmAppointment = async (id: string) => {
    const { error } = await supabase
      .from('appointments')
      .update({ status: 'confirmed' })
      .eq('id', id);

    if (error) showError("Erro ao confirmar.");
    else {
      showSuccess("Agendamento confirmado!");
      fetchData();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="container">
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-4xl font-black text-slate-900 flex items-center gap-3">
            <Activity className="h-8 w-8 text-primary" /> Painel de Gestão
          </h1>
          <Button variant="outline" onClick={() => navigate("/")} className="rounded-xl">
            <LogOut className="mr-2 h-4 w-4" /> Sair
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="glass-card border-none">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold text-slate-500 flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-emerald-500" /> Faturamento Previsto
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-slate-900">R$ {metrics.faturamentoPrevisto.toLocaleString()}</div>
              <p className="text-xs text-slate-400 mt-1">Baseado em agendamentos ativos</p>
            </CardContent>
          </Card>

          <Card className="glass-card border-none">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold text-slate-500 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-blue-500" /> Conversão IA
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-slate-900">{metrics.conversaoIA}%</div>
              <p className="text-xs text-slate-400 mt-1">Agendamentos via WhatsApp</p>
            </CardContent>
          </Card>

          <Card className="glass-card border-none bg-primary/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold text-primary flex items-center gap-2">
                <Zap className="h-4 w-4" /> Receita Recuperada
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-primary">R$ {metrics.receitaRecuperada.toLocaleString()}</div>
              <p className="text-xs text-primary/60 mt-1">Capturado fora do horário comercial</p>
            </CardContent>
          </Card>
        </div>

        <Card className="glass-card border-none overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-100/50">
              <TableRow>
                <TableHead className="font-bold">Paciente</TableHead>
                <TableHead className="font-bold">Serviço</TableHead>
                <TableHead className="font-bold">Data</TableHead>
                <TableHead className="font-bold">Status</TableHead>
                <TableHead className="text-right font-bold">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {appointments.map((app) => (
                <TableRow key={app.id} className="hover:bg-white/50 transition-colors">
                  <TableCell>
                    <div className="font-bold text-slate-900">{app.clients?.name}</div>
                    <div className="text-xs text-slate-500">{app.clients?.phone}</div>
                  </TableCell>
                  <TableCell className="font-medium">{app.services?.name || app.service}</TableCell>
                  <TableCell>{format(new Date(app.appointment_date), 'dd/MM/yyyy HH:mm')}</TableCell>
                  <TableCell>
                    <Badge variant={app.status === 'confirmed' ? 'default' : 'outline'} className={app.status === 'confirmed' ? 'bg-emerald-500' : ''}>
                      {app.status === 'requested' ? 'Pendente' : app.status === 'scheduled' ? 'Agendado' : 'Confirmado'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {app.status !== 'confirmed' && (
                      <Button size="sm" onClick={() => confirmAppointment(app.id)} className="bg-emerald-500 hover:bg-emerald-600 rounded-xl">
                        <CheckCircle className="h-4 w-4 mr-1" /> Confirmar
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
};

export default ClinicAdmin;