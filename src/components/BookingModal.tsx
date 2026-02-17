"use client";

import React, { useState, useEffect } from "react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { supabase } from "@/integrations/supabase/client";
import { showSuccess, showError } from "@/utils/toast";
import { formatPhone, stripNonDigits } from "@/lib/formatters";
import { Loader2, Stethoscope, CalendarDays, User, Phone, CheckCircle2, Calendar as CalendarIcon, Download, MessageCircle } from "lucide-react";
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
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<string>("private");
  const [selectedInsuranceId, setSelectedInsuranceId] = useState<string>("");
  const [insurances, setInsurances] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen) {
      const fetchInsurances = async () => {
        const { data } = await supabase.from('insurances').select('*').order('name');
        setInsurances(data || []);
      };
      fetchInsurances();
    }
  }, [isOpen]);

  const generateWhatsAppLink = () => {
    const insuranceName = insurances.find(i => i.id === selectedInsuranceId)?.name || "";
    const typeLabel = paymentMethod === 'private' ? 'Particular' : `Convênio (${insuranceName})`;
    const message = encodeURIComponent(
      `Olá Julia! Sou ${contactName}. Gostaria de confirmar meu agendamento para ${service?.name} no dia ${format(selectedDate, "dd/MM")} às ${selectedTime}h. Tipo: ${typeLabel}.`
    );
    return `https://wa.me/551633334444?text=${message}`;
  };

  const handleBooking = async () => {
    const phoneDigits = stripNonDigits(contactPhone);

    if (!contactName.trim() || phoneDigits.length < 10) {
      showError("Por favor, preencha Nome e WhatsApp corretamente.");
      return;
    }

    if (paymentMethod === 'insurance' && !selectedInsuranceId) {
      showError("Selecione seu convênio.");
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

      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .upsert({ 
          phone: phoneDigits, 
          name: contactName.trim(),
          updated_at: new Date().toISOString()
        }, { onConflict: 'phone' })
        .select().single();

      if (clientError) throw clientError;

      const { error: appError } = await supabase
        .from('appointments')
        .insert({
          service_id: service?.id,
          client_id: clientData.id,
          appointment_date: appointmentDate.toISOString(),
          payment_method: paymentMethod,
          insurance_id: paymentMethod === 'insurance' ? selectedInsuranceId : null,
          status: 'requested',
          service: service?.name,
          notes: { source: "web_portal" }
        });

      if (appError) throw appError;

      setIsSuccess(true);
      showSuccess("Solicitação enviada com sucesso!");

    } catch (err: any) {
      showError(err.message || "Erro ao processar solicitação.");
    } finally {
      setLoading(false);
    }
  };

  // Time slots de 30 em 30 min, das 08:00 às 18:00
  const timeSlots = [];
  for (let h = 8; h <= 18; h++) {
    timeSlots.push(`${h.toString().padStart(2, '0')}:00`);
    if (h < 18) timeSlots.push(`${h.toString().padStart(2, '0')}:30`);
  }

  if (isSuccess) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[500px] glass-card rounded-[2.5rem] p-0 overflow-hidden border-none">
          <div className="bg-emerald-500 p-12 text-white text-center">
            <CheckCircle2 className="h-20 w-20 mx-auto mb-6 animate-in zoom-in duration-500" />
            <DialogTitle className="text-3xl font-black mb-2">Solicitado!</DialogTitle>
            <DialogDescription className="text-emerald-100 text-lg">
              Sua consulta para <strong>{service?.name}</strong> está sendo processada.
            </DialogDescription>
          </div>
          <div className="p-8 space-y-4">
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 mb-6">
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Detalhes</p>
              <p className="text-xl font-bold text-slate-900">{format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}</p>
              <p className="text-slate-600">Às {selectedTime}h · {paymentMethod === 'private' ? 'Particular' : 'Convênio'}</p>
            </div>

            <Button 
              asChild
              className="w-full h-16 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-lg shadow-lg shadow-emerald-100"
            >
              <a href={generateWhatsAppLink()} target="_blank" rel="noreferrer">
                <MessageCircle className="mr-2 h-6 w-6" /> Falar com Julia (WhatsApp)
              </a>
            </Button>

            <Button 
              variant="ghost"
              onClick={onClose}
              className="w-full h-14 rounded-2xl font-bold text-slate-500"
            >
              Fechar
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
                placeholder="Seu Nome Completo"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                className="pl-12 h-12 rounded-2xl bg-slate-50 border-slate-200 focus:ring-primary"
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
            <label className="text-sm font-bold text-slate-700">Tipo de Atendimento</label>
            <ToggleGroup type="single" value={paymentMethod} onValueChange={(v) => v && setPaymentMethod(v)} className="justify-start gap-2">
              <ToggleGroupItem value="private" className="rounded-xl px-6 border-2 data-[state=on]:bg-primary data-[state=on]:text-white">Particular</ToggleGroupItem>
              <ToggleGroupItem value="insurance" className="rounded-xl px-6 border-2 data-[state=on]:bg-primary data-[state=on]:text-white">Convênio</ToggleGroupItem>
            </ToggleGroup>

            {paymentMethod === 'insurance' && (
              <Select value={selectedInsuranceId} onValueChange={setSelectedInsuranceId}>
                <SelectTrigger className="h-12 rounded-2xl bg-slate-50 border-slate-200">
                  <SelectValue placeholder="Selecione seu convênio" />
                </SelectTrigger>
                <SelectContent>
                  {insurances.map((ins) => (
                    <SelectItem key={ins.id} value={ins.id}>{ins.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
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
            {loading ? <Loader2 className="animate-spin mr-2" /> : "Finalizar Agendamento"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BookingModal;