import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, User, LogOut, Plus } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useNavigate } from "react-router-dom";

const PatientPortal = () => {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAppointments = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login");
        return;
      }

      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          services (name, duration),
          profiles!appointments_doctor_id_fkey (full_name)
        `)
        .eq('patient_id', user.id)
        .order('appointment_date', { ascending: true });

      if (!error) setAppointments(data || []);
      setLoading(false);
    };

    fetchAppointments();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="container max-w-5xl">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-extrabold text-slate-900">Olá, Paciente</h1>
            <p className="text-slate-500">Gerencie seus agendamentos na Sanca Saúde.</p>
          </div>
          <div className="flex gap-4">
            <Button className="bg-blue-600 hover:bg-blue-700 rounded-xl">
              <Plus className="mr-2 h-4 w-4" /> Novo Agendamento
            </Button>
            <Button variant="outline" onClick={handleLogout} className="rounded-xl">
              <LogOut className="mr-2 h-4 w-4" /> Sair
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20">Carregando...</div>
        ) : (
          <div className="grid gap-6">
            {appointments.length === 0 ? (
              <Card className="p-12 text-center border-dashed border-2">
                <p className="text-slate-500">Você ainda não possui agendamentos.</p>
              </Card>
            ) : (
              appointments.map((app) => (
                <Card key={app.id} className="overflow-hidden border-none shadow-md hover:shadow-lg transition-shadow">
                  <div className="flex flex-col md:flex-row">
                    <div className="bg-blue-600 p-6 text-white flex flex-col justify-center items-center min-w-[150px]">
                      <span className="text-3xl font-bold">{format(new Date(app.appointment_date), 'dd')}</span>
                      <span className="uppercase text-sm font-medium">{format(new Date(app.appointment_date), 'MMM', { locale: ptBR })}</span>
                    </div>
                    <CardContent className="p-6 flex-grow grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                      <div>
                        <h3 className="text-xl font-bold text-slate-900">{app.services?.name}</h3>
                        <div className="flex items-center text-slate-500 text-sm mt-1">
                          <User className="h-4 w-4 mr-1" /> Dr(a). {app.profiles?.full_name || 'A definir'}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center text-slate-600">
                          <Clock className="h-4 w-4 mr-2 text-blue-500" />
                          {format(new Date(app.appointment_date), 'HH:mm')} ({app.services?.duration} min)
                        </div>
                        <div className="flex items-center text-slate-600">
                          <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                          {format(new Date(app.appointment_date), "EEEE, dd 'de' MMMM", { locale: ptBR })}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`px-4 py-1 rounded-full text-xs font-bold uppercase ${
                          app.status === 'scheduled' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {app.status === 'scheduled' ? 'Confirmado' : app.status}
                        </span>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientPortal;