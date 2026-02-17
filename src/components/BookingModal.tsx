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
import { Loader2, Stethoscope, CalendarDays, User, Phone, Fingerprint, CheckCircle2, Calendar as CalendarIcon, Download } from "lucide-react";
import { ptBR } from "date-fns/locale";
import { format } from "date-fns";

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
  const [isSuccess, setIsSuccess] = useState(false);
  const [appointmentId, setAppointmentId] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactCpf, setContactCpf] = useState("");
  const [contactPhone, setContactPhone] = useState("");

  const generateGoogleCalendarLink = () => {
    const [hours, minutes] = selectedTime.split(":").map(Number);
    const start = new Date(selectedDate);
    start.setHours(hours, minutes, 0, 0);
    const end = new Date(start.getTime() + (service?.duration || 60) * 60000);
    
    const fmt = (d: Date) => d.toISOString().replace(/-|:|\.\d+/g, "");
    const title = encodeURIComponent(`Consulta: ${service?.name} - Sanca Saúde`);
    const details = encodeURIComponent(`Olá ${contactName}, sua consulta está agendada na Sanca Saúde.`);
    const location = encodeURIComponent("Av. São Carlos, 1000, Centro, São Carlos - SP");
    
    return `https://www.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${fmt(start)}/${fmt(end)}&details=${details}&location=${location}`;
  };

  const downloadICal = () => {
    const [hours, minutes] = selectedTime.split(":").map(Number);
    const start = new Date(selectedDate);
    start.setHours(hours, minutes, 0, 0);
    const end = new Date(start.getTime() + (service?.duration || 60) * 60000);
    
    const fmt = (d: Date) => d.toISOString().replace(/-|:|\.\d+/g, "");
    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "BEGIN:VEVENT",
      `DTSTART:${fmt(start)}`,
      `DTEND:${fmt(end)}`,
      `SUMMARY:Consulta: ${service?.name} - Sanca Saúde`,
      `DESCRIPTION:Olá ${contactName}, sua consulta está agendada na Sanca Saúde.`,
      "LOCATION:Av. São Carlos, 1000, Centro, São Carlos - SP",
      "END:VEVENT",
      "END:VCALENDAR"
    ].join("\r\n");

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute("download", "consulta-sanca-saude.ics");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleBooking = async () => {
    const phoneDigits = stripNonDigits(contactPhone);
    const cpfDigits = stripNonDigits(contactCpf);

    if (!contactName.trim() || phoneDigits.length < 10) {
      showError("Por favor, preencha Nome e WhatsApp corretamente.");
      return;
    }

    if (!selectedTime) {
      showError("Selecione um horário.");
      return;
    }

    setLoading(true);

    try {
      const [hours, minutes] = selectedTime.split(":").map(Number);
      const appointmentDate = new Date(selectedDate);
      appointmentDate.setHours(hours, minutes, 0, 0);

      const response = await fetch("https://zwoqzptpoekzwracicbm.supabase.co/functions/v1/submit-booking-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${supabase.auth.getSession()}`
        },
        body: JSON.stringify({
          service_id: service?.id,
          appointment_date: appointmentDate.toISOString(),
          contact: {
            name: contactName.trim(),
            phone: phoneDigits,
            cpf: cpfDigits || null
          },
          source: "web_portal"
        })
      });

      const result = await response.json();

      if (!response.ok) throw new Error(result.error || "Erro ao processar agendamento.");

      setAppointmentId(result.appointmentId);
      setIsSuccess(true);
      showSuccess("Solicitação enviada com sucesso!");

    } catch (err: any) {
      console.error("Erro no agendamento:", err);
      showError(err.message || "Erro ao processar solicitação.");
    } finally {
      setLoading(false);
    }
  };

  const timeSlots = ["08:00", "09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00"];

  if (isSuccess) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[500px] glass-card rounded-[2.5rem] p-0 overflow-hidden border-none">
          <div className="bg-emerald-500 p-12 text-white text-center">
            <CheckCircle2 className="h-20 w-20 mx-auto mb-6 animate-in zoom-in duration-500" />
            <DialogTitle className="text-3xl font-black mb-2">Agendado!</DialogTitle>
            <DialogDescription className="text-emerald-100 text-lg">
              Sua solicitação para <strong>{service?.name}</strong> foi enviada.
            </DialogDescription>
          </div>
          <div className="p-8 space-y-4">
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 mb-6">
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Detalhes</p>
              <p className="text-xl font-bold text-slate-900">{format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}</p>
              <p className="text-slate-600">Às {selectedTime}h</p>
            </div>

            <Button 
              asChild
              className="w-full h-14 rounded-2xl bg-slate-900 hover:bg-primary text-white font-bold"
            >
              <a href={generateGoogleCalendarLink()} target="_blank" rel="noreferrer">
                <CalendarIcon className="mr-2 h-5 w-5" /> Adicionar ao Google Agenda
              </a>
            </Button>

            <Button 
              variant="outline"
              onClick={downloadICal}
              className="w-full h-14 rounded-2xl border-2 font-bold"
            >
              <Download className="mr-2 h-5 w-5" /> Baixar Lembrete (iCal)
            </Button>

            <Button 
              variant="ghost"
              onClick={() => navigate(`/checkout?appointment_id=${appointmentId}`)}
              className="w-full h-14 rounded-2xl font-bold text-slate-500"
            >
              Ir para o Checkout
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

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
                placeholder="CPF (Opcional)"
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