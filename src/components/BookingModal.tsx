import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { showSuccess, showError } from "@/utils/toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Loader2, CalendarDays, User, Clock } from "lucide-react";

interface BookingModalProps {
  service: any;
  isOpen: boolean;
  onClose: () => void;
}

const BookingModal = ({ service, isOpen, onClose }: BookingModalProps) => {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchDoctors = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('role', 'doctor');
      setDoctors(data || []);
    };
    if (isOpen) fetchDoctors();
  }, [isOpen]);

  const handleBooking = async () => {
    if (!selectedDoctor || !selectedDate || !selectedTime) {
      showError("Por favor, preencha todos os campos.");
      return;
    }

    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      showError("Você precisa estar logado para agendar.");
      setLoading(false);
      return;
    }

    const appointmentDate = new Date(selectedDate);
    const [hours, minutes] = selectedTime.split(':');
    appointmentDate.setHours(parseInt(hours), parseInt(minutes));

    const { error } = await supabase
      .from('appointments')
      .insert({
        patient_id: user.id,
        service_id: service.id,
        doctor_id: selectedDoctor,
        appointment_date: appointmentDate.toISOString(),
        status: 'scheduled'
      });

    if (error) {
      showError("Erro ao realizar agendamento.");
    } else {
      showSuccess("Consulta agendada com sucesso!");
      onClose();
    }
    setLoading(false);
  };

  const timeSlots = ["08:00", "09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00"];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] overflow-y-auto max-h-screen">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-blue-600">Agendar {service?.name}</DialogTitle>
          <DialogDescription>
            Escolha o melhor profissional e horário para seu atendimento.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-2"><User className="h-4 w-4" /> Selecione o Médico</Label>
            <Select onValueChange={setSelectedDoctor}>
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Escolha um profissional" />
              </SelectTrigger>
              <SelectContent>
                {doctors.map((doc) => (
                  <SelectItem key={doc.id} value={doc.id}>{doc.full_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2"><CalendarDays className="h-4 w-4" /> Data da Consulta</Label>
            <div className="border rounded-2xl p-2 bg-slate-50 flex justify-center">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={(date) => date < new Date() || date.getDay() === 0}
                locale={ptBR}
                className="rounded-md"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2"><Clock className="h-4 w-4" /> Horários Disponíveis</Label>
            <div className="grid grid-cols-4 gap-2">
              {timeSlots.map((time) => (
                <Button
                  key={time}
                  variant={selectedTime === time ? "default" : "outline"}
                  className={`rounded-xl ${selectedTime === time ? 'bg-blue-600' : ''}`}
                  onClick={() => setSelectedTime(time)}
                >
                  {time}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button 
            className="w-full bg-blue-600 hover:bg-blue-700 py-6 rounded-xl text-lg font-bold shadow-xl"
            onClick={handleBooking}
            disabled={loading}
          >
            {loading ? <Loader2 className="animate-spin h-5 w-5" /> : "Confirmar Agendamento"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BookingModal;