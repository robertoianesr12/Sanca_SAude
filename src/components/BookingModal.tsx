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
    if (Number.isNaN(hours) || Number.isNaN(minutes)) {
      showError("Horário inválido.");
      return;
    }

    const appointmentDate = new Date(selectedDate);
    appointmentDate.setHours(hours, minutes, 0, 0);

    setLoading(true);

    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;

    const { data, error } = await supabase.functions.invoke(
      "submit-booking-request",
      {
        body: {
          service_id: service?.id,
          doctor_id: selectedDoctor || null,
          appointment_date: appointmentDate.toISOString(),
          requested_time: selectedTime,
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

    setLoading(false);

    if (error || !data?.ok) {
      showError("Erro ao registrar a solicitação.");
      console.error("BookingModal submit-booking-request", { error, data });
      return;
    }

    showSuccess("Solicitação enviada! Em breve entraremos em contato.");
    setContactName("");
    setContactCpf("");
    setContactPhone("");
    setSelectedTime("");
    setSelectedDoctor("");
    setSelectedDate(new Date());
  };

  const timeSlots = [
    "08:00",
    "09:00",
    "10:00",
    "11:00",
    "12:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
    "18:00",
    "19:00",
    "20:00",
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[calc(100vw-1.5rem)] max-w-[calc(100vw-1.5rem)] sm:max-w-[560px] max-h-[calc(100svh-1.5rem)] overflow-hidden rounded-[1.5rem] sm:rounded-[2rem] border border-border shadow-2xl p-4 sm:p-6">
        <div className="max-h-[calc(100svh-1.5rem)] overflow-y-auto pr-1">
          <DialogHeader>
            <div className="flex items-start gap-3 mb-2">
              <div className="shrink-0 rounded-2xl bg-blue-50 p-3">
                <Stethoscope className="h-6 w-6 text-blue-600" />
              </div>
              <div className="min-w-0">
                <DialogTitle className="text-2xl font-extrabold text-foreground leading-tight">
                  Agendar {service?.name}
                </DialogTitle>
                <DialogDescription className="mt-1">
                  Preencha Nome, CPF e Telefone — não é necessário fazer login.
                  Receberemos a solicitação e confirmaremos o horário.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-6 py-2">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-muted-foreground block mb-1">
                  Nome Completo
                </label>
                <Input
                  placeholder="Maria Silva"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="rounded-xl h-12"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground block mb-1">
                  CPF
                </label>
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
              <div>
                <label className="text-sm font-medium text-muted-foreground block mb-1">
                  Telefone
                </label>
                <Input
                  placeholder="(11) 98765-4321"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(formatPhone(e.target.value))}
                  className="rounded-xl h-12"
                  maxLength={16}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground block mb-1">
                  Especialista (opcional)
                </label>
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

            <div>
              <label className="text-sm font-medium text-muted-foreground block mb-1">
                Data da Consulta
              </label>
              <div className="border border-border/60 rounded-3xl p-2 bg-background">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  disabled={(date) => date < new Date()}
                  className="rounded-lg"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Horários disponíveis
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Clique para escolher um horário.
                  </p>
                </div>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="grid grid-cols-3 gap-2">
                {timeSlots.map((slot) => (
                  <Button
                    key={slot}
                    type="button"
                    variant={selectedTime === slot ? "default" : "outline"}
                    className={`rounded-2xl text-sm h-10 ${
                      selectedTime === slot
                        ? "bg-blue-600 text-white"
                        : "border-border/60"
                    }`}
                    onClick={() => setSelectedTime(slot)}
                  >
                    {slot}
                  </Button>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-border/50 bg-secondary/30 p-4 shadow-inner">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-foreground">
                  Prévia do atendimento
                </p>
                <Badge className="border border-border/30 bg-background text-sm text-foreground">
                  {selectedTime ? "Solicitação" : "Preenchimento"}
                </Badge>
              </div>
              <div className="w-full overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>CPF</TableHead>
                      <TableHead>Telefone</TableHead>
                      <TableHead>Serviço</TableHead>
                      <TableHead>Data/Hora</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>{contactName || "—"}</TableCell>
                      <TableCell>{contactCpf || "—"}</TableCell>
                      <TableCell>{contactPhone || "—"}</TableCell>
                      <TableCell>{service?.name || "—"}</TableCell>
                      <TableCell>{formatPreviewDate()}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>

          <DialogFooter className="flex-col gap-3">
            <Button
              onClick={handleBooking}
              disabled={loading}
              className="w-full rounded-2xl bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold text-lg shadow-lg"
            >
              {loading ? (
                <Loader2 className="animate-spin h-5 w-5" />
              ) : (
                "Enviar solicitação"
              )}
            </Button>
            <p className="text-xs text-muted-foreground text-center px-6">
              Consulta agendada por um de nossos especialistas de plantão. Caso
              necessite reagendar, o admin poderá mover manualmente.
            </p>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BookingModal;