"use client";

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { showSuccess, showError } from "@/utils/toast";
import { formatCpf, formatPhone, stripNonDigits } from "@/lib/formatters";
import { Loader2, Stethoscope, CalendarDays, User, Phone, CreditCard, Fingerprint } from "lucide-react";
import { ptBR } from "date-fns/locale";

interface BookingModalProps {
  service: any;
  isOpen: boolean;
  onClose: () => void;
}

const BookingModal = ({ service, isOpen, onClose }: BookingModalProps) => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [contactName, setContactName] = useState("");
  const [contactCpf, setContactCpf] = useState("");
  const [contactPhone, setContactPhone] = useState("");

  const handleBooking = async () => {
    const cpfDigits = stripNonDigits(contactCpf);
    const phoneDigits = stripNonDigits(contactPhone);

    if (!contactName.trim() || phoneDigits.length < 10 || cpfDigits.length < 11) {
      showError("Por favor, preencha Nome, CPF e WhatsApp corretamente.");
      return;
    }

    if (!selectedTime) {
      showError("Selecione um horário.");
      return;
    }

    setLoading(true);

    try {
      // 1. Criar ou atualizar o cliente
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .upsert({
          name: contactName.trim(),
          cpf: cpfDigits,
          phone: phoneDigits,
        }, { onConflict: 'cpf' })
        .select()
        .single();

      if (clientError) throw clientError;

      // 2. Preparar a data do agendamento
      const [hours, minutes] = selectedTime.split(":").map(Number);
      const appointmentDate = new Date(selectedDate);
      appointmentDate.setHours(hours, minutes, 0, 0);

      // 3. Criar o agendamento
      const { data: appointmentData, error: appointmentError } = await supabase
        .from('appointments')
        .insert({
          client_id: clientData.id,
          service_id: service?.id,
          service: service?.name,
          appointment_date: appointmentDate.toISOString(),
          status: 'requested',
          notes: { source: 'web_portal' }
        })
        .select()
        .single();

      if (appointmentError) throw appointmentError;

      showSuccess("Solicitação iniciada! Redirecionando para o checkout...");
      
      // Redireciona para o checkout com o ID do agendamento
      setTimeout(() => {
        onClose();
        navigate(`/checkout?appointment_id=${appointmentData.id}`);
      }, 1500);

    } catch (err: any) {
      console.error("Erro no agendamento:", err);
      showError("Erro ao processar solicitação. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const timeSlots = ["08:00", "09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00"];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] glass-card rounded-[2.5rem] p-0 overflow-hidden border-none">
        <div className="bg-primary p-8 text-white">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
              <Stethoscope className="h-6 w-6" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold">Agendar Consulta</DialogTitle>
              <DialogDescription className="text-blue-100">
                {service?.name}
              </DialogDescription>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
          <div className="space-y-4">
            <div className="relative">
              <User className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
              <Input
                placeholder="Nome Completo"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                className="pl-12 h-12 rounded-2xl bg-slate-50 border-slate-200 focus:ring-primary"
              />
            </div>
            <div className="relative">
              <Fingerprint className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
              <Input
                placeholder="CPF"
                value={contactCpf}
                onChange={(e) => setContactCpf(formatCpf(e.target.value))}
                className="pl-12 h-12 rounded-2xl bg-slate-50 border-slate-200"
                maxLength={14}
              />
            </div>
            <div className="relative">
              <Phone className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
              <Input
                placeholder="WhatsApp"
                value={contactPhone}
                onChange={(e) => setContactPhone(formatPhone(e.target.value))}
                className="pl-12 h-12 rounded-2xl bg-slate-50 border-slate-200"
                maxLength={15}
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-primary" /> Selecione a Data
            </label>
            <div className="flex justify-center bg-slate-50 rounded-3xl p-2 border border-slate-100">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                disabled={(date) => date < new Date()}
                locale={ptBR}
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-bold text-slate-700">Horários Disponíveis</label>
            <div className="grid grid-cols-4 gap-2">
              {timeSlots.map((slot) => (
                <Button
                  key={slot}
                  variant={selectedTime === slot ? "default" : "outline"}
                  onClick={() => setSelectedTime(slot)}
                  className={`rounded-xl h-10 font-medium transition-all ${
                    selectedTime === slot ? "bg-primary shadow-md scale-105" : "hover:border-primary/30"
                  }`}
                >
                  {slot}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="p-8 pt-0">
          <Button
            onClick={handleBooking}
            disabled={loading}
            className="w-full h-14 rounded-2xl bg-slate-900 hover:bg-primary text-white font-bold text-lg btn-apple"
          >
            {loading ? <Loader2 className="animate-spin mr-2" /> : "Confirmar Agendamento"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BookingModal;