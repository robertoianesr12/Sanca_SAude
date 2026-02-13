import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2, CreditCard, ShieldCheck } from "lucide-react";
import { showSuccess, showError } from "@/utils/toast";

const Checkout = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [appointment, setAppointment] = useState<any>(null);
  const appointmentId = searchParams.get("appointment_id");

  useEffect(() => {
    if (!appointmentId) {
      navigate("/servicos");
      return;
    }

    const fetchAppointment = async () => {
      const { data } = await supabase
        .from('appointments')
        .select('*, services(name, price)')
        .eq('id', appointmentId)
        .single();
      setAppointment(data);
    };

    fetchAppointment();
  }, [appointmentId, navigate]);

  const handleConfirmPayment = async () => {
    setLoading(true);
    const { error } = await supabase
      .from('appointments')
      .update({ status: 'confirmed' })
      .eq('id', appointmentId);

    if (error) {
      showError("Erro ao confirmar agendamento.");
    } else {
      showSuccess("Agendamento confirmado com sucesso!");
      setTimeout(() => navigate("/portal"), 2000);
    }
    setLoading(false);
  };

  if (!appointment) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <div className="container py-20 max-w-2xl">
        <Card className="glass-card rounded-[2.5rem] overflow-hidden">
          <CardHeader className="bg-primary p-10 text-white text-center">
            <CheckCircle2 className="h-16 w-16 mx-auto mb-4 opacity-80" />
            <CardTitle className="text-3xl font-black">Quase lá!</CardTitle>
            <p className="text-blue-100">Confirme os detalhes para finalizar seu agendamento.</p>
          </CardHeader>
          <CardContent className="p-10 space-y-8">
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b pb-4">
                <span className="text-slate-500 font-medium">Serviço</span>
                <span className="font-bold text-slate-900">{appointment.services?.name}</span>
              </div>
              <div className="flex justify-between items-center border-b pb-4">
                <span className="text-slate-500 font-medium">Data</span>
                <span className="font-bold text-slate-900">{new Date(appointment.appointment_date).toLocaleString('pt-BR')}</span>
              </div>
              <div className="flex justify-between items-center pt-4">
                <span className="text-xl font-black text-slate-900">Total</span>
                <span className="text-3xl font-black text-primary">R$ {appointment.services?.price?.toFixed(2)}</span>
              </div>
            </div>

            <div className="bg-blue-50 p-6 rounded-2xl flex items-start space-x-4">
              <ShieldCheck className="h-6 w-6 text-primary mt-1" />
              <p className="text-sm text-slate-600 leading-relaxed">
                Seu agendamento será confirmado instantaneamente após a validação. Você receberá os detalhes via WhatsApp.
              </p>
            </div>

            <Button 
              onClick={handleConfirmPayment} 
              disabled={loading}
              className="w-full py-8 rounded-2xl bg-slate-900 hover:bg-primary text-xl font-bold shadow-xl transition-all"
            >
              {loading ? <Loader2 className="animate-spin mr-2" /> : <><CreditCard className="mr-2 h-6 w-6" /> Confirmar Agendamento</>}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Checkout;