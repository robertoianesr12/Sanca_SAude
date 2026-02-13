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
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHead,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { showSuccess, showError } from "@/utils/toast";
import { formatCpf, formatPhone, stripNonDigits } from "@/lib/formatters";
import { Loader2, Clock, Stethoscope } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

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
        .select("id, full_name, role")
        .eq("role", "doctor");

      setDoctors(data || []);
    };

    if (isOpen) {
      fetchQualifiedDoctors();
    }
  }, [isOpen]);

  const formatPreviewDate = () => {
    if (!selectedTime) return "Horário pendente";
    return `${format(selectedDate, "dd/MM/yyyy")} às ${selectedTime}`;
  };

  const handleBooking = async () => {
    if (!contactName.trim() || !contactCpf.trim() || !contactPhone.trim()) {
      showError("Preencha Nome, CPF e Telefone.");
      return;
    }

    if (!selectedTime) {
      showError("Escolha um horário disponível.");
      return;
    }

    const cpfDigits = stripNonDigits(contactCpf);
    const phoneDigits = stripNonDigits(contactPhone);

    if (cpfDigits.length !== 11) {
      showError("CPF inválido.");
      return;
    }

    const [hours, minutes] = selectedTime.split(":").map(Number);
    const appointmentDate = new Date(selectedDate);
    appointmentDate.setHours(hours, minutes, 0, 0);

    setLoading(true);

    try {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;

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
            source: user ? "auth" : "walk-in",
            patient_id: user?.id ?? null,
          },
        }
      );

      if (error) throw error;

      showSuccess("Solicitação enviada! Em breve entraremos em contato.");
      onClose();
      // Reset form
      setContactName("");
      setContactCpf("");
      setContactPhone("");
      setSelectedTime("");
    } catch (err: any) {
      console.error("Erro ao agendar:", err);
      showError(err.message || "Erro ao registrar a solicitação.");
    } finally {
      setLoading(false);
    }
  };

  const timeSlots = [
    "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", 
    "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00",
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[calc(100vw-1.5rem)] max-w-[560px] max-h-[90vh] overflow-y-auto rounded-[2rem] border border-border shadow-2xl p-6">
        <DialogHeader>
          <div className="flex items-start gap-3 mb-2">
            <div className="shrink-0 rounded-2xl bg-blue-50 p-3">
              <Stethoscope className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-extrabold text-foreground">
                Agendar {service?.name}
              </DialogTitle>
              <DialogDescription className="mt-1">
                Preencha seus dados para solicitar um horário.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Nome Completo</label>
              <Input
                placeholder="Maria Silva"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                className="rounded-xl h-12"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">CPF</label>
              <Input
                placeholder="000.000.000-00"
                value={contactCpf}
                onChange={(e) => setContactCpf(formatCpf(e.target.value))}
                className="rounded-xl h-12"
                maxLength={14}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Telefone</label>
              <Input
                placeholder="(11) 98765-4321"
                value={contactPhone}
                onChange={(e) => setContactPhone(formatPhone(e.target.value))}
                className="rounded-xl h-12"
                maxLength={16}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Especialista (opcional)</label>
              <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
                <SelectTrigger className="rounded-xl h-12">
                  <SelectValue placeholder="Selecione um profissional" />
                </SelectTrigger>
                <SelectContent>
                  {doctors.map((doctor) => (
                    <SelectItem key={doctor.id} value={doctor.id}>
                      {doctor.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Data da Consulta</label>
            <div className="border rounded-3xl p-2 bg-background flex justify-center">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                disabled={(date) => date < new Date()}
                className="rounded-lg"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Horários disponíveis</label>
            <div className="grid grid-cols-3 gap-2">
              {timeSlots.map((slot) => (
                <Button
                  key={slot}
                  type="button"
                  variant={selectedTime === slot ? "default" : "outline"}
                  className={`rounded-2xl text-sm h-10 ${
                    selectedTime === slot ? "bg-blue-600 text-white" : ""
                  }`}
                  onClick={() => setSelectedTime(slot)}
                >
                  {slot}
                </Button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-border/50 bg-secondary/30 p-4">
            <p className="text-sm font-semibold text-foreground mb-2">Resumo da Solicitação</p>
            <div className="text-xs space-y-1 text-muted-foreground">
              <p><span className="font-medium">Paciente:</span> {contactName || "—"}</p>
              <p><span className="font-medium">Serviço:</span> {service?.name}</p>
              <p><span className="font-medium">Data/Hora:</span> {formatPreviewDate()}</p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={handleBooking}
            disabled={loading}
            className="w-full rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg h-14 shadow-lg"
          >
            {loading ? <Loader2 className="animate-spin h-5 w-5" /> : "Enviar Solicitação"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BookingModal;