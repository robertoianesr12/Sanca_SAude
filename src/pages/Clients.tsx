import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCpf, formatPhone } from "@/lib/formatters";
import { showError, showSuccess } from "@/utils/toast";
import { Plus, Edit, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Client {
  id: string;
  name: string;
  cpf: string;
  phone: string;
  email: string;
  created_at: string;
}

const Clients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [name, setName] = useState("");
  const [cpf, setCpf] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('name');

    if (error) {
      showError("Erro ao carregar clientes");
      console.error(error);
    } else {
      setClients(data || []);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const clientData = {
      name: name.trim(),
      cpf: cpf.replace(/\D/g, ''),
      phone: phone.replace(/\D/g, ''),
      email: email.trim()
    };

    if (!clientData.name || clientData.cpf.length !== 11) {
      showError("Preencha todos os campos obrigatórios corretamente");
      return;
    }

    let result;
    if (editingClient) {
      result = await supabase
        .from('clients')
        .update(clientData)
        .eq('id', editingClient.id);
    } else {
      result = await supabase
        .from('clients')
        .insert(clientData);
    }

    if (result.error) {
      showError(`Erro ao ${editingClient ? 'atualizar' : 'criar'} cliente`);
      console.error(result.error);
    } else {
      showSuccess(`Cliente ${editingClient ? 'atualizado' : 'criado'} com sucesso!`);
      resetForm();
      fetchClients();
    }
  };

  const resetForm = () => {
    setName("");
    setCpf("");
    setPhone("");
    setEmail("");
    setEditingClient(null);
    setIsFormOpen(false);
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setName(client.name);
    setCpf(formatCpf(client.cpf));
    setPhone(formatPhone(client.phone || ""));
    setEmail(client.email || "");
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Tem certeza que deseja excluir este cliente?")) return;
    
    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', id);

    if (error) {
      showError("Erro ao excluir cliente");
      console.error(error);
    } else {
      showSuccess("Cliente excluído com sucesso!");
      fetchClients();
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
            <h1 className="text-3xl font-bold text-slate-900">Gerenciamento de Clientes</h1>
            <p className="text-slate-600">Gerencie seus clientes e seus dados</p>
          </div>
          <Button 
            onClick={() => setIsFormOpen(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="mr-2 h-4 w-4" />
            Novo Cliente
          </Button>
        </div>

        {isFormOpen && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>
                {editingClient ? "Editar Cliente" : "Novo Cliente"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nome Completo *</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Nome completo do cliente"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="cpf">CPF *</Label>
                    <Input
                      id="cpf"
                      value={cpf}
                      onChange={(e) => setCpf(formatCpf(e.target.value))}
                      placeholder="000.000.000-00"
                      maxLength={14}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(formatPhone(e.target.value))}
                      placeholder="(11) 99999-9999"
                      maxLength={16}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="email@exemplo.com"
                    />
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
                    {editingClient ? "Atualizar" : "Criar"} Cliente
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4">
          {clients.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-slate-500">Nenhum cliente cadastrado ainda.</p>
              <Button 
                onClick={() => setIsFormOpen(true)}
                className="mt-4 bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="mr-2 h-4 w-4" />
                Criar Primeiro Cliente
              </Button>
            </Card>
          ) : (
            clients.map((client) => (
              <Card key={client.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">{client.name}</h3>
                      <div className="mt-2 space-y-1">
                        <p className="text-slate-600">CPF: {formatCpf(client.cpf)}</p>
                        {client.phone && (
                          <p className="text-slate-600">Telefone: {formatPhone(client.phone)}</p>
                        )}
                        {client.email && (
                          <p className="text-slate-600">Email: {client.email}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(client)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(client.id)}
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

export default Clients;