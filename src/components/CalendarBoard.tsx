import React, { useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { showError, showSuccess } from "@/utils/toast";
import { addDays, format, isSameDay, startOfWeek } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Loader2 } from "lucide-react";

interface CalendarBoardProps {
  appointments: any[];
  onReschedule?: () => void;
}

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
];

const CalendarBoard = ({ appointments, onReschedule }: CalendarBoardProps) => {
  const [activeSlot, setActiveSlot] = useState<string | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const weekDays = useMemo(() => {
    const today = new Date();
    const monday = startOfWeek(today, { weekStartsOn: 1 });
    return Array.from({ length: 5 }, (_, index) => addDays(monday, index));
  }, []);

  const getSlotKey = (day: Date, slot: string) => `${format(day, "yyyy-MM-dd")}-${slot}`;

  const getSlotAppointments = (day: Date, slot: string) => {
    return appointments
      .filter((appointment) => {
        const appointmentDate = new Date(appointment.appointment_date);
        return (
          format(appointmentDate, "yyyy-MM-dd") === format(day, "yyyy-MM-dd") &&
          format(appointmentDate, "HH:mm") === slot
        );
      })
      .sort((a, b) => new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime());
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>, day: Date, slot: string) => {
    event.preventDefault();
    const slotKey = getSlotKey(day, slot);
    setActiveSlot(slotKey);
  };

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>, day: Date, slot: string) => {
    event.preventDefault();
    const appointmentId = event.dataTransfer.getData("text/plain");
    if (!appointmentId) return;

    const targetDate = new Date(day);
    const [hours, minutes] = slot.split(":");
    targetDate.setHours(Number(hours), Number(minutes), 0, 0);

    const appointment = appointments.find((item) => item.id === appointmentId);
    if (!appointment) {
      setActiveSlot(null);
      return;
    }

    const previousDate = new Date(appointment.appointment_date);
    if (previousDate.getTime() === targetDate.getTime()) {
      setActiveSlot(null);
      return;
    }

    setIsUpdating(true);
    const { error } = await supabase
      .from("appointments")
      .update({ appointment_date: targetDate.toISOString() })
      .eq("id", appointmentId);

    setIsUpdating(false);
    setActiveSlot(null);
    setDraggedId(null);

    if (error) {
      showError("Não foi possível reagendar esta consulta.");
    } else {
      showSuccess("Consulta reagendada com sucesso!");
      onReschedule?.();
    }
  };

  const handleDragStart = (event: React.DragEvent<HTMLDivElement>, appointmentId: string) => {
    event.dataTransfer.setData("text/plain", appointmentId);
    event.dataTransfer.effectAllowed = "move";
    setDraggedId(appointmentId);
  };

  const handleDragEnd = () => {
    setActiveSlot(null);
    setDraggedId(null);
  };

  return (
    <div className="bg-gradient-to-br from-white to-slate-50 rounded-[3rem] border border-slate-100 shadow-2xl mb-10 p-8">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-8">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-blue-500 font-semibold">Agenda Cinemática</p>
          <h3 className="text-3xl md:text-4xl font-extrabold text-slate-900 mt-2">Calendário dinâmico</h3>
          <p className="text-slate-500 mt-1">Arraste um card de consulta para reagendar o horário em um clique.</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.4em] text-slate-400">
          <Loader2 className={`h-4 w-4 ${isUpdating ? "animate-spin" : ""}`} />
          {isUpdating ? "Reagendando" : "Somente arraste"}
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 min-w-[900px]">
          {weekDays.map((day) => (
            <div key={day.toISOString()} className="bg-slate-900/5 rounded-3xl border border-slate-100 p-4 flex flex-col shadow-xl">
              <div className="mb-4">
                <p className="text-sm text-slate-500 uppercase tracking-[0.3em]">{format(day, "eeee", { locale: ptBR })}</p>
                <p className="text-2xl font-bold text-slate-900">{format(day, "dd/MM")}</p>
                <p className="text-xs text-slate-500">{format(day, "d 'de' MMMM", { locale: ptBR })}</p>
              </div>

              <div className="space-y-3">
                {timeSlots.map((slot) => {
                  const slotKey = getSlotKey(day, slot);
                  const slotAppointments = getSlotAppointments(day, slot);
                  const isActive = activeSlot === slotKey;

                  return (
                    <div
                      key={slotKey}
                      className={`rounded-3xl border-2 bg-white/80 p-3 min-h-[100px] transition-all ${
                        isActive
                          ? "border-blue-300 bg-blue-50/80"
                          : "border-dashed border-slate-200"
                      }`}
                      onDragOver={(event) => handleDragOver(event, day, slot)}
                      onDragLeave={() => setActiveSlot(null)}
                      onDrop={(event) => handleDrop(event, day, slot)}
                    >
                      <p className="text-[10px] uppercase tracking-[0.4em] text-slate-400 mb-2">{slot}</p>
                      <div className="space-y-2">
                        {slotAppointments.map((appointment) => (
                          <div
                            key={appointment.id}
                            className={`bg-white rounded-2xl p-3 shadow-lg border ${
                              draggedId === appointment.id ? "opacity-50" : ""
                            } cursor-grab flex flex-col gap-1`}
                            draggable
                            onDragStart={(event) => handleDragStart(event, appointment.id)}
                            onDragEnd={handleDragEnd}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-semibold text-slate-900">
                                  {appointment.services?.name || "Serviço"}
                                </p>
                                <p className="text-xs text-slate-500" />
                              </div>
                              <Badge className="text-xs uppercase tracking-[0.3em]" variant={appointment.status === "scheduled" ? "secondary" : "outline"}>
                                {appointment.status === "scheduled" ? "Agendada" : appointment.status}
                              </Badge>
                            </div>
                            <p className="text-xs text-slate-500">
                              {appointment.profiles?.full_name || "Paciente"}
                            </p>
                          </div>
                        ))}
                        {slotAppointments.length === 0 && <p className="text-[11px] text-slate-400 italic">Arraste uma consulta</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CalendarBoard;
