import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Users, Calendar, Activity, LogOut, CheckCircle, User, Clock } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import { showError, showSuccess } from "@/utils/toast";
import CalendarBoard from "@/components/CalendarBoard";
import { Link } from "react-router-dom";

const ClinicAdmin = () => {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, pending: 0 });
  const [loadingAppointments, setLoadingAppointments] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login");
        return;
      }
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      if (profile?.role === 'patient') {
        navigate("/portal");
        return;
      }
      fetchData();
    };
    checkAdmin();
  }, [navigate]);

  const fetchData = async () => {
    setLoadingAppointments(true);
    // Alterado para buscar de 'clients' em vez de 'profiles'
    const { data, error } = await supabase
      .from('appointments')
      .select(` 
        *, 
        services (name), 
        clients (name, phone) 
      `)
      .order('appointment_date', { ascending: true });
    
    setLoadingAppointments(false);
    if (error) {
      showError("Falha ao carregar agendamentos.");
      return;
    }
    setAppointments(data || []);
    setStats({
      total: data?.length || 0,
      pending: data?.filter((a) => a.status === 'scheduled' || a.status === 'requested').length || 0
    });
  };

  const completeAppointment = async (id: string) => {
    const { error } = await supabase
      .from('appointments')
      .update({ status: 'completed' })
      .eq('id', id);
    if (error) showError("Erro ao atualizar.");
    else {
      showSuccess("Atendimento concluído!");
      fetchData();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="container">
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-4xl font-extrabold text-slate-900 flex items-center gap-3">
            <Activity className="h-8 w-8 text-blue-600" />
            Painel Clínico
          </h1>
          <Button variant="outline" onClick={() => supabase.auth.signOut().then(() => navigate("/"))}>
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Link to="/clients">
            <Card className="bg-white border-none shadow-md hover:shadow-xl transition-shadow cursor-pointer">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-500 flex items-center">
                  <User className="mr-2 h-4 w-4" />
                  Clientes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-slate-900">Gerenciar</div>
              </CardContent>
            </Card>
          </Link>
          
          <Link to="/appointments">
            <Card className="bg-white border-none shadow-md hover:shadow-xl transition-shadow cursor-pointer">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-500 flex items-center">
                  <Clock className="mr-2 h-4 w-4" />
                  Agendamentos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-slate-900">Gerenciar</div>
              </CardContent>
            </Card>
          </Link>
          
          <Card className="bg-white border-none shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Pacientes Ativos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-slate-900">124</div>
            </CardContent>
          </Card>
        </div>

        <CalendarBoard appointments={appointments} onReschedule={fetchData} />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 mt-10">
          <Card className="bg-blue-600 text-white border-none shadow-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium opacity-80">Total de Agendamentos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-none shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Pendentes Hoje</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-blue-600">{stats.pending}</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-none shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Pacientes Ativos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-slate-900">124</div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-none shadow-xl overflow-hidden">
          <TableHeader className="bg-slate-100">
            <TableRow>
              <TableHead className="font-bold">Paciente</TableHead>
              <TableHead className="font-bold">Serviço</TableHead>
              <TableHead className="font-bold">Data/Hora</TableHead>
              <TableHead className="font-bold">Status</TableHead>
              <TableHead className="text-right font-bold">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {appointments.map((app) => (
              <TableRow key={app.id} className="hover:bg-slate-50 transition-colors">
                <TableCell>
                  <div className="font-bold">{app.clients?.name || "N/A"}</div>
                  <div className="text-xs text-slate-500">{app.clients?.phone}</div>
                </TableCell>
                <TableCell>{app.services?.name || app.service}</TableCell>
                <TableCell>{format(new Date(app.appointment_date), 'dd/MM/yyyy HH:mm')}</TableCell>
                <TableCell>
                  <Badge variant={app.status === 'scheduled' || app.status === 'requested' ? 'default' : 'outline'} className={app.status === 'scheduled' ? 'bg-blue-500 text-white' : ''}>
                    {app.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {(app.status === 'scheduled' || app.status === 'requested') && (
                    <Button size="sm" variant="ghost" className="text-green-600 hover:text-green-700 hover:bg-green-50" onClick={() => completeAppointment(app.id)}>
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Concluir
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Card>
      </div>
    </div>
  );
};

export default ClinicAdmin;