"use client";

import React, { useState, useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { showSuccess, showError } from "@/utils/toast";
import { formatCpf, formatPhone, stripNonDigits } from "@/lib/formatters";
import { Loader2, Stethoscope, CalendarDays, User, Phone, CreditCard } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface BookingModalProps {
  service: any;
  isOpen: boolean;
  onClose: () => void;
}

const BookingModal = ({ service, isOpen, onClose }: BookingModalProps) => {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [contactName, setContactName] = useState("");
  const [contactCpf, setContactCpf] = useState("");
  const [contactPhone, setContactPhone] = useState("");

  useEffect(() => {
    const fetchQualifiedDoctors = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id, full_name")
        .eq("role", "doctor");
      setDoctors(data || []);
    };

    if (isOpen) fetchQualifiedDoctors();
  }, [isOpen]);

  const handleBooking = async () => {
    const cpfDigits = stripNonDigits(contactCpf);
    const phoneDigits = stripNonDigits(contactPhone);

    if (!contactName.trim() || cpfDigits.length !== 11 || phoneDigits.length < 10) {
      showError("Por favor, preencha todos os campos corretamente.");
      return;
    }

    if (!selectedTime) {
      showError("Selecione um horário para o atendimento.");
      return;
    }

    setLoading(true);

    try {
      const [hours, minutes] = selectedTime.split(":").map(Number);
      const appointmentDate = new Date(selectedDate);
      appointmentDate.setHours(hours, minutes, 0, 0);

      const { data: userData } = await supabase.auth.getUser();

      const { data, error } = await supabase.functions.invoke(
        "submit-booking-request",
        {
          body: {
            service_id: service?.id,
            doctor_id: selectedDoctor || null,
            appointment_date: appointmentDate.toISOString(),
            contact: {
              name: contactName.trim(),
              cpf: cpfDigits,
              phone: phoneDigits,
            },
            source: "web_portal",
            patient_id: userData?.user?.id || null,
          },
        }
      );

      if (error) throw error;

      showSuccess("Solicitação enviada com sucesso! Entraremos em contato em breve.");
      onClose();
      // Reset
      setContactName("");
      setContactCpf("");
      setContactPhone("");
      setSelectedTime("");
    } catch (err: any) {
      console.error("Erro no agendamento:", err);
      showError("Não foi possível processar sua solicitação. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const timeSlots = ["08:00", "09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00"];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
        <div className="bg-blue-600 p-8 text-white">
          <div className="flex items-center gap-4 mb-4">
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
                className="pl-12 h-12 rounded-xl bg-slate-50 border-slate-200 focus:ring-blue-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <CreditCard className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                <Input
                  placeholder="CPF"
                  value={contactCpf}
                  onChange={(e) => setContactCpf(formatCpf(e.target.value))}
                  className="pl-12 h-12 rounded-xl bg-slate-50 border-slate-200"
                  maxLength={14}
                />
              </div>
              <div className="relative">
                <Phone className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                <Input
                  placeholder="Telefone"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(formatPhone(e.target.value))}
                  className="pl-12 h-12 rounded-xl bg-slate-50 border-slate-200"
                  maxLength={15}
                />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-blue-600" /> Selecione a Data
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
                    selectedTime === slot ? "bg-blue-600 shadow-md scale-105" : "hover:border-blue-300"
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
            className="w-full h-14 rounded-2xl bg-slate-900 hover:bg-blue-600 text-white font-bold text-lg transition-all shadow-lg"
          >
            {loading ? <Loader2 className="animate-spin mr-2" /> : "Confirmar Solicitação"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BookingModal;