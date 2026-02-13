import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Plus, Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { showError, showSuccess } from "@/utils/toast";
import { useNavigate } from "react-router-dom";

interface Client {
  id: string;
  name: string;
}

interface Appointment {
  id: string;
  client_id: string;
  service: string;
  appointment_date: string;
  status: string;
  notes: any;
  created_at: string;
  client?: Client;
}

const Appointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [clientId, setClientId] = useState("");
  const [service, setService] = useState("");
  const [appointmentDate, setAppointmentDate] = useState<Date | undefined>(new Date());
  const [status, setStatus] = useState("scheduled");
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [clientsRes, appointmentsRes] = await Promise.all([
      supabase.from('clients').select('id, name').order('name'),
      supabase
        .from('appointments')
        .select(`
          *,
          client:clients(name)
        `)
        .order('appointment_date', { ascending: false })
    ]);

    if (clientsRes.error) {
      showError("Erro ao carregar clientes");
      console.error(clientsRes.error);
    } else {
      setClients(clientsRes.data || []);
    }

    if (appointmentsRes.error) {
      showError("Erro ao carregar agendamentos");
      console.error(appointmentsRes.error);
    } else {
      setAppointments(appointmentsRes.data || []);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!clientId || !service || !appointmentDate) {
      showError("Preencha todos os campos obrigatórios");
      return;
    }

    const appointmentData = {
      client_id: clientId,
      service: service.trim(),
      appointment_date: appointmentDate.toISOString(),
      status
    };

    let result;
    if (editingAppointment) {
      result = await supabase
        .from('appointments')
        .update(appointmentData)
        .eq('id', editingAppointment.id);
    } else {
      result = await supabase
        .from('appointments')
        .insert(appointmentData);
    }

    if (result.error) {
      showError(`Erro ao ${editingAppointment ? 'atualizar' : 'criar'} agendamento`);
      console.error(result.error);
    } else {
      showSuccess(`Agendamento ${editingAppointment ? 'atualizado' : 'criado'} com sucesso!`);
      resetForm();
      fetchData();
    }
  };

  const resetForm = () => {
    setClientId("");
    setService("");
    setAppointmentDate(new Date());
    setStatus("scheduled");
    setEditingAppointment(null);
    setIsFormOpen(false);
  };

  const handleEdit = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setClientId(appointment.client_id);
    setService(appointment.service);
    setAppointmentDate(new Date(appointment.appointment_date));
    setStatus(appointment.status);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Tem certeza que deseja excluir este agendamento?")) return;
    
    const { error } = await supabase
      .from('appointments')
      .delete()
      .eq('id', id);

    if (error) {
      showError("Erro ao excluir agendamento");
      console.error(error);
    } else {
      showSuccess("Agendamento excluído com sucesso!");
      fetchData();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 py-12">
        <div className="container max-w-5xl">
          <div className="text-center py-20">Carregando...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="container max-w-5xl">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Gerenciamento de Agendamentos</h1>
            <p className="text-slate-600">Gerencie os agendamentos dos seus clientes</p>
          </div>
          <Button 
            onClick={() => setIsFormOpen(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="mr-2 h-4 w-4" />
            Novo Agendamento
          </Button>
        </div>

        {isFormOpen && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>
                {editingAppointment ? "Editar Agendamento" : "Novo Agendamento"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="client">Cliente *</Label>
                    <select
                      id="client"
                      value={clientId}
                      onChange={(e) => setClientId(e.target.value)}
                      className="w-full p-2 border rounded-md"
                      required
                    >
                      <option value="">Selecione um cliente</option>
                      {clients.map((client) => (
                        <option key={client.id} value={client.id}>
                          {client.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="service">Serviço *</Label>
                    <Input
                      id="service"
                      value={service}
                      onChange={(e) => setService(e.target.value)}
                      placeholder="Tipo de serviço"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="date">Data e Hora *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !appointmentDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {appointmentDate ? (
                            format(appointmentDate, "PPP HH:mm", { locale: ptBR })
                          ) : (
                            <span>Selecione uma data</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={appointmentDate}
                          onSelect={setAppointmentDate}
                          initialFocus
                        />
                        <div className="p-3 border-t">
                          <Label>Hora</Label>
                          <Input
                            type="time"
                            value={appointmentDate ? format(appointmentDate, "HH:mm") : ""}
                            onChange={(e) => {
                              if (appointmentDate) {
                                const [hours, minutes] = e.target.value.split(":").map(Number);
                                const newDate = new Date(appointmentDate);
                                newDate.setHours(hours, minutes);
                                setAppointmentDate(newDate);
                              }
                            }}
                          />
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <select
                      id="status"
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="scheduled">Agendado</option>
                      <option value="confirmed">Confirmado</option>
                      <option value="completed">Concluído</option>
                      <option value="cancelled">Cancelado</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetForm}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                    {editingAppointment ? "Atualizar" : "Criar"} Agendamento
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4">
          {appointments.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-slate-500">Nenhum agendamento cadastrado ainda.</p>
              <Button 
                onClick={() => setIsFormOpen(true)}
                className="mt-4 bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="mr-2 h-4 w-4" />
                Criar Primeiro Agendamento
              </Button>
            </Card>
          ) : (
            appointments.map((appointment) => (
              <Card key={appointment.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">
                        {appointment.client?.name || "Cliente não encontrado"}
                      </h3>
                      <div className="mt-2 space-y-1">
                        <p className="text-slate-600">
                          <span className="font-medium">Serviço:</span> {appointment.service}
                        </p>
                        <p className="text-slate-600">
                          <span className="font-medium">Data:</span>{" "}
                          {format(new Date(appointment.appointment_date), "PPP HH:mm", { locale: ptBR })}
                        </p>
                        <p className="text-slate-600">
                          <span className="font-medium">Status:</span>{" "}
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            appointment.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                            appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                            appointment.status === 'completed' ? 'bg-purple-100 text-purple-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {appointment.status === 'scheduled' ? 'Agendado' :
                             appointment.status === 'confirmed' ? 'Confirmado' :
                             appointment.status === 'completed' ? 'Concluído' : 'Cancelado'}
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(appointment)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(appointment.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Appointments;