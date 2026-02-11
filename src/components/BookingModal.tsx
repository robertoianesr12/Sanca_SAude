import React, { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { showSuccess, showError } from "@/utils/toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Loader2, CalendarDays, User, Clock, Stethoscope } from "lucide-react";

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
  const [fetchingDoctors, setFetchingDoctors] = useState(false);

  useEffect(() => {
    const fetchQualifiedDoctors = async () => {
      if (!service?.specialty_id) {
        // Se o serviço não tiver especialidade vinculada, busca todos os médicos
        const { data } = await supabase
          .from('profiles')
          .select('id, full_name')
          .eq('role', 'doctor');
        setDoctors(data || []);
        return;
      }

      setFetchingDoctors(true);
      // Busca médicos que pertencem à especialidade do serviço
      const { data, error } = await supabase
        .from('doctors')
        .select(`
          id,
          profiles:id (
            full_name
          )
        `)
        .eq('specialty_id', service.specialty_id);

      if (!error && data) {
        const formattedDoctors = data.map((d: any) => ({
          id: d.id,
          full_name: d.profiles.full_name
        }));
        setDoctors(formattedDoctors);
      }
      setFetchingDoctors(false);
    };

    if (isOpen && service) fetchQualifiedDoctors();
  }, [isOpen, service]);

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
      <DialogContent className="sm:max-w-[500px] overflow-y-auto max-h-[90vh] rounded-[2rem]">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-blue-50 rounded-2xl">
              <Stethoscope className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold text-slate-900">Agendar {service?.name}</DialogTitle>
              <DialogDescription>
                Selecione um especialista disponível.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-slate-700 font-semibold">
              <User className="h-4 w-4 text-blue-500" /> Profissional Especialista
            </Label>
            <Select onValueChange={setSelectedDoctor} disabled={fetchingDoctors}>
              <SelectTrigger className="rounded-xl border-slate-200 h-12">
                <SelectValue placeholder={fetchingDoctors ? "Buscando especialistas..." : "Escolha um profissional"} />
              </SelectTrigger>
              <SelectContent>
                {doctors.length > 0 ? (
                  doctors.map((doc) => (
                    <SelectItem key={doc.id} value={doc.id}>{doc.full_name}</SelectItem>
                  ))
                ) : (
                  <div className="p-4 text-sm text-slate-500 text-center">Nenhum especialista encontrado para este serviço.</div>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-slate-700 font-semibold">
              <CalendarDays className="h-4 w-4 text-blue-500" /> Data da Consulta
            </Label>
            <div className="border border-slate-100 rounded-3xl p-2 bg-slate-50/50 flex justify-center">
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
            <Label className="flex items-center gap-2 text-slate-700 font-semibold">
              <Clock className="h-4 w-4 text-blue-500" /> Horários Disponíveis
            </Label>
            <div className="grid grid-cols-4 gap-2">
              {timeSlots.map((time) => (
                <Button
                  key={time}
                  variant={selectedTime === time ? "default" : "outline"}
                  className={`rounded-xl h-11 font-medium transition-all ${
                    selectedTime === time 
                    ? 'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200' 
                    : 'hover:border-blue-200 hover:bg-blue-50'
                  }`}
                  onClick={() => setSelectedTime(time)}
                >
                  {time}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="sm:justify-center">
          <Button 
            className="w-full bg-slate-900 hover:bg-blue-600 py-7 rounded-2xl text-lg font-bold shadow-xl transition-all active:scale-95"
            onClick={handleBooking}
            disabled={loading || doctors.length === 0}
          >
            {loading ? <Loader2 className="animate-spin h-5 w-5" /> : "Confirmar Agendamento"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BookingModal;