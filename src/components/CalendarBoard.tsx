import React, { useMemo, useState } from "react";
import { addDays, format, startOfWeek } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { showError, showSuccess } from "@/utils/toast";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface CalendarAppointment {
  id: string;
  appointment_date: string;
  status: string;
  services?: {
    name?: string;
  };
  patient?: {
    full_name?: string;
  };
  doctor?: {
    full_name?: string;
  };
  patient_name?: string;
  doctor_name?: string;
}

interface CalendarBoardProps {
  appointments?: CalendarAppointment[];
  onReschedule?: () => void;
}

type NormalizedAppointment = {
  id: string;
  start: Date;
  status: string;
  title: string;
  patientLabel?: string;
  doctorLabel?: string;
  isTest?: boolean;
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
] as const;

const sampleBlueprint = [
  { day: 0, time: "08:00", patient: "Luiza Monteiro", service: "Check-up Executivo", doctor: "Matheus Costa", status: "scheduled" },
  { day: 0, time: "10:00", patient: "Jorge Pereira", service: "Terapia Hormonal", doctor: "Ana Bittencourt", status: "preparing" },
  { day: 1, time: "09:00", patient: "Marina F.", service: "Consulta Ginecológica", doctor: "Sabrina Costa", status: "scheduled" },
  { day: 1, time: "15:00", patient: "Gabriel S.", service: "Retorno Ortopédico", doctor: "Paulo Lima", status: "scheduled" },
  { day: 2, time: "13:00", patient: "Felipe Rodrigues", service: "Avaliação Cardiológica", doctor: "Vinícius Lara", status: "completed" },
  { day: 3, time: "14:00", patient: "Isabela T.", service: "Fisioterapia Avançada", doctor: "Rafael Souza", status: "scheduled" },
  { day: 3, time: "16:00", patient: "Equipe de Teste", service: "Teleconsulta Multidisciplinar", doctor: "Victor Nascimento", status: "scheduled" },
  { day: 4, time: "18:00", patient: "Henrique Santos", service: "Retorno Neurológico", doctor: "Mariana López", status: "scheduled" },
  { day: 4, time: "19:00", patient: "Ana C.", service: "Consulta Nutricional", doctor: "Leonardo Fonseca", status: "scheduled" },
];

const getStatusLabel = (status: string) => {
  if (status === "scheduled" || status === "confirmed") return "Agendada";
  if (status === "preparing") return "Em preparação";
  if (status === "completed") return "Concluída";
  if (status === "canceled" || status === "cancelled") return "Cancelada";
  return status.toUpperCase();
};

const getStatusBadgeClasses = (status: string) => {
  if (status === "scheduled" || status === "confirmed") {
    return "bg-yellow-100 text-yellow-800 border-yellow-200";
  }
  if (status === "preparing") {
    return "bg-blue-100 text-blue-800 border-blue-200";
  }
  if (status === "completed") {
    return "bg-emerald-100 text-emerald-800 border-emerald-200";
  }
  if (status === "canceled" || status === "cancelled") {
    return "bg-rose-100 text-rose-800 border-rose-200";
  }
  return "bg-slate-100 text-slate-600 border-slate-200";
};

const CalendarBoard = ({ appointments = [], onReschedule }: CalendarBoardProps) => {
  const [activeSlot, setActiveSlot] = useState<string | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const weekDays = useMemo(() => {
    const today = new Date();
    const monday = startOfWeek(today, { weekStartsOn: 1 });
    return Array.from({ length: 5 }, (_, index) => addDays(monday, index));
  }, []);

  const normalizedAppointments = useMemo(() => {
    return appointments
      .map((appointment) => {
        const appointmentDate = new Date(appointment.appointment_date);
        if (Number.isNaN(appointmentDate.getTime())) return null;

        return {
          id: appointment.id,
          start: appointmentDate,
          status: appointment.status,
          title: appointment.services?.name ?? "Consulta",
          patientLabel: appointment.patient?.full_name ?? appointment.patient_name,
          doctorLabel: appointment.doctor?.full_name ?? appointment.doctor_name,
        } as NormalizedAppointment;
      })
      .filter((item): item is NormalizedAppointment => Boolean(item))
      .sort((a, b) => a.start.getTime() - b.start.getTime());
  }, [appointments]);

  const sampleAppointments = useMemo(() => {
    return sampleBlueprint
      .map((entry) => {
        const targetDay = weekDays[entry.day];
        if (!targetDay) return null;

        const [hours, minutes] = entry.time.split(":").map(Number);
        const date = new Date(targetDay);
        date.setHours(hours, minutes, 0, 0);

        return {
          id: `test-${entry.day}-${entry.time.replace(":", "")}-${entry.patient.replace(/\s+/g, "")}`,
          start: date,
          status: entry.status,
          title: entry.service,
          patientLabel: entry.patient,
          doctorLabel: entry.doctor,
          isTest: true,
        } as NormalizedAppointment;
      })
      .filter((entry): entry is NormalizedAppointment => Boolean(entry))
      .sort((a, b) => a.start.getTime() - b.start.getTime());
  }, [weekDays]);

  const timelineAppointments = useMemo(() => {
    return [...normalizedAppointments, ...sampleAppointments].sort(
      (a, b) => a.start.getTime() - b.start.getTime(),
    );
  }, [normalizedAppointments, sampleAppointments]);

  const totalAppointments = timelineAppointments.length;
  const scheduledCount = timelineAppointments.filter(
    (appointment) => appointment.status === "scheduled" || appointment.status === "confirmed",
  ).length;
  const completedCount = timelineAppointments.filter(
    (appointment) => appointment.status === "completed",
  ).length;
  const testCount = sampleAppointments.length;

  const stats = [
    { label: "Consultas totais", value: totalAppointments, caption: "Incluindo sessões reais e testes" },
    { label: "Agendadas", value: scheduledCount, caption: "Fluxo aguardando atendimento" },
    { label: "Concluídas", value: completedCount, caption: "Atendimentos finalizados" },
    { label: "Consultas de teste", value: testCount, caption: "Avaliação das experiências" },
  ];

  const getSlotKey = (day: Date, slot: string) => `${format(day, "yyyyMMdd")}-${slot}`;

  const getSlotAppointments = (day: Date, slot: string) =>
    timelineAppointments.filter((appointment) => {
      const appointmentDate = appointment.start;
      return (
        appointmentDate.getFullYear() === day.getFullYear() &&
        appointmentDate.getMonth() === day.getMonth() &&
        appointmentDate.getDate() === day.getDate() &&
        format(appointmentDate, "HH:mm") === slot
      );
    });

  const handleDragStart = (event: React.DragEvent<HTMLDivElement>, appointment: NormalizedAppointment) => {
    if (appointment.isTest) {
      event.preventDefault();
      return;
    }
    setDraggedId(appointment.id);
    event.dataTransfer?.setData("text/plain", appointment.id);
    event.dataTransfer?.setDragImage(new Image(), 0, 0);
    event.dataTransfer?.setData("text/plain", appointment.id);
    event.dataTransfer?.setDragImage(new Image(), 0, 0);
    event.dataTransfer && (event.dataTransfer.effectAllowed = "move");
  };

  const handleDragEnd = () => {
    setDraggedId(null);
  };

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>, day: Date, slot: string) => {
    event.preventDefault();
    if (!draggedId) {
      return;
    }

    const appointmentToReschedule = appointments.find((item) => item.id === draggedId);

    if (!appointmentToReschedule) {
      setActiveSlot(null);
      return;
    }

    setIsUpdating(true);
    const [hours, minutes] = slot.split(":").map(Number);
    const targetDate = new Date(day);
    targetDate.setHours(hours, minutes, 0, 0);

    const { error } = await supabase
      .from("appointments")
      .update({ appointment_date: targetDate.toISOString() })
      .eq("id", appointmentToReschedule.id);

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

  return (
    <section className="space-y-8">
      <div className="rounded-[2.5rem] bg-gradient-to-br from-slate-900 via-blue-700 to-emerald-500 p-6 shadow-2xl text-white">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.4em] text-white/70">Agenda semanal</p>
            <h2 className="text-3xl md:text-4xl font-extrabold">Calendário cinemático</h2>
            <p className="text-white/80 max-w-3xl">
              Visualize a evolução dos atendimentos, reagende arrastando cards reais e mantenha uma trilha de testes sempre visível.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.4em] text-white/80">
            <Loader2 className={`h-4 w-4 ${isUpdating ? "animate-spin" : "opacity-40"}`} />
            <span>{isUpdating ? "Sincronizando compromissos…" : "Arraste para reagendar"}</span>
          </div>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-2xl bg-white/15 p-4 shadow-inner border border-white/20">
              <p className="text-[10px] uppercase tracking-[0.4em] text-white/70">{stat.label}</p>
              <p className="text-3xl font-bold text-white mt-2">{stat.value}</p>
              <p className="text-[12px] text-white/70 mt-1">{stat.caption}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="rounded-[2.5rem] border border-border/70 bg-white shadow-2xl p-6">
          <div className="overflow-x-auto">
            <div className="min-w-[960px]">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {weekDays.map((day) => (
                  <div key={day.toISOString()} className="flex flex-col gap-4 rounded-[1.75rem] border border-border/40 bg-background/80 p-4 shadow-lg">
                    <div className="space-y-1">
                      <p className="text-[11px] uppercase tracking-[0.4em] text-muted-foreground">
                        {format(day, "eeee", { locale: ptBR })}
                      </p>
                      <p className="text-3xl font-extrabold text-foreground">{format(day, "dd")}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {format(day, "d 'de' MMMM", { locale: ptBR })}
                      </p>
                    </div>
                    <div className="space-y-3">
                      {timeSlots.map((slot) => {
                        const slotKey = getSlotKey(day, slot);
                        const slotAppointments = getSlotAppointments(day, slot);
                        const isActive = activeSlot === slotKey;

                        return (
                          <div
                            key={slotKey}
                            className={cn(
                              "rounded-2xl border-2 p-3 transition min-h-[110px]",
                              isActive ? "border-primary/70 bg-primary/5 shadow-xl" : "border-dashed border-border/40 bg-white/60",
                            )}
                            onDragOver={(event) => {
                              event.preventDefault();
                              setActiveSlot(slotKey);
                            }}
                            onDragLeave={() => setActiveSlot(null)}
                            onDrop={(event) => handleDrop(event, day, slot)}
                          >
                            <p className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground mb-2">{slot}</p>
                            <div className="space-y-2">
                              {slotAppointments.length === 0 && (
                                <p className="text-[11px] italic text-muted-foreground">Horário livre</p>
                              )}
                              {slotAppointments.map((appointment) => (
                                <div
                                  key={appointment.id}
                                  draggable={!appointment.isTest}
                                  onDragStart={(event) => handleDragStart(event, appointment)}
                                  onDragEnd={handleDragEnd}
                                  className={cn(
                                    "rounded-2xl border p-3 shadow-sm transition-colors",
                                    appointment.isTest
                                      ? "border-dashed border-primary/40 bg-primary/5 cursor-not-allowed"
                                      : "border-border/30 bg-secondary/20 cursor-grab hover:border-primary/60",
                                  )}
                                >
                                  <div className="flex items-center justify-between">
                                    <p className="text-sm font-semibold text-foreground">{appointment.title}</p>
                                    <span
                                      className={cn(
                                        "text-[9px] font-semibold uppercase tracking-[0.3em] px-2 py-0.5 rounded-full border",
                                        getStatusBadgeClasses(appointment.status),
                                      )}
                                    >
                                      {getStatusLabel(appointment.status)}
                                    </span>
                                  </div>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {appointment.patientLabel ?? "Paciente sem nome"}
                                  </p>
                                  <p className="text-[11px] text-muted-foreground">
                                    {appointment.doctorLabel ? `Dr(a). ${appointment.doctorLabel}` : "Especialista indefinido"}
                                  </p>
                                </div>
                              ))}
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
        </div>

        <div className="space-y-4 rounded-[2.5rem] border border-border/70 bg-gray-50/80 p-6 shadow-2xl">
          <div className="flex items-center justify-between">
            <div>
              <Badge className="bg-accent/20 text-accent-foreground text-[11px] uppercase tracking-[0.4em] px-3 py-1 rounded-full">
                Consultas simuladas
              </Badge>
              <h3 className="text-2xl font-extrabold text-foreground mt-3">Fluxo de testes</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Esses cards ajudam a validar interações sem impactar dados reais.
              </p>
            </div>
          </div>
          <div className="space-y-4">
            {sampleAppointments.map((appointment) => (
              <Card key={appointment.id} className="rounded-2xl border border-border/40 bg-white shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-bold text-foreground">{appointment.patientLabel}</CardTitle>
                  <p className="text-[11px] text-muted-foreground">
                    {format(appointment.start, "EEEE, dd/MM", { locale: ptBR })} · {format(appointment.start, "HH:mm")}
                  </p>
                </CardHeader>
                <CardContent className="px-0 pt-0">
                  <p className="text-sm text-muted-foreground">{appointment.title}</p>
                  <p className="text-sm font-semibold text-primary mt-1">
                    Dr(a). {appointment.doctorLabel}
                  </p>
                  <span
                    className={cn(
                      "mt-4 inline-flex items-center justify-center rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em]",
                      getStatusBadgeClasses(appointment.status),
                    )}
                  >
                    {getStatusLabel(appointment.status)}
                  </span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CalendarBoard;