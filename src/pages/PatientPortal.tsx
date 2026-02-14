import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, Activity, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const PatientPortal = () => {
  const { id } = useParams();
  const [appointment, setAppointment] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointment = async () => {
      if (!id) return;
      const { data } = await supabase
        .from('appointments')
        .select('*, services(*), clients(*)')
        .eq('id', id)
        .single();
      
      setAppointment(data);
      setLoading(false);
    };

    fetchAppointment();
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Carregando seu agendamento...</div>;
  if (!appointment) return <div className="min-h-screen flex items-center justify-center">Agendamento não encontrado.</div>;

  return (
    <div className="min-h-screen bg-slate-50 py-20">
      <div className="container max-w-2xl">
        <div className="text-center mb-12">
          <Activity className="h-12 w-12 text-primary mx-auto mb-4" />
          <h1 className="text-3xl font-black text-slate-900">Olá, {appointment.clients?.name.split(' ')[0]}!</h1>
          <p className="text-slate-500">Aqui estão os detalhes da sua consulta na Sanca Saúde.</p>
        </div>

        <Card className="glass-card border-none rounded-[2.5rem] overflow-hidden">
          <div className="bg-primary p-8 text-white flex justify-between items-center">
            <div>
              <p className="text-blue-100 text-sm font-bold uppercase tracking-widest">Status</p>
              <h2 className="text-2xl font-black">
                {appointment.status === 'confirmed' ? 'Confirmado' : 'Em Processamento'}
              </h2>
            </div>
            <CheckCircle2 className="h-10 w-10 opacity-50" />
          </div>
          
          <CardContent className="p-10 space-y-8">
            <div className="flex items-start gap-6">
              <div className="bg-blue-50 p-4 rounded-2xl">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-400 uppercase">Data e Hora</p>
                <p className="text-xl font-bold text-slate-900">
                  {format(new Date(appointment.appointment_date), "EEEE, dd 'de' MMMM", { locale: ptBR })}
                </p>
                <p className="text-lg text-slate-600 flex items-center gap-2">
                  <Clock className="h-4 w-4" /> {format(new Date(appointment.appointment_date), "HH:mm")}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-6">
              <div className="bg-blue-50 p-4 rounded-2xl">
                <Activity className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-400 uppercase">Serviço</p>
                <p className="text-xl font-bold text-slate-900">{appointment.services?.name}</p>
                <p className="text-slate-600">{appointment.services?.description}</p>
              </div>
            </div>

            <div className="flex items-start gap-6">
              <div className="bg-blue-50 p-4 rounded-2xl">
                <MapPin className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-400 uppercase">Localização</p>
                <p className="text-xl font-bold text-slate-900">Unidade Centro</p>
                <p className="text-slate-600">Av. São Carlos, 1000, São Carlos - SP</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-slate-400 text-sm mt-8">
          Precisa reagendar? Entre em contato pelo WhatsApp (16) 3333-4444
        </p>
      </div>
    </div>
  );
};

export default PatientPortal;