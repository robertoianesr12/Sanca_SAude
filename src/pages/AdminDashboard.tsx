import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { showSuccess, showError } from "@/utils/toast";
import { useNavigate } from "react-router-dom";
import { Package, Clock, CheckCircle, LogOut, Building } from "lucide-react";

interface Order {
  id: string;
  customer_name: string;
  phone: string;
  address: string;
  items: any[];
  total: number;
  status: string;
  company_id: string;
  created_at: string;
}

const AdminDashboard = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const initialize = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login");
        return;
      }

      // Buscar o perfil para saber a empresa
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', session.user.id)
        .single();

      if (profileError || !profile) {
        showError("Perfil não encontrado. Contate o suporte.");
        return;
      }

      setCompanyId(profile.company_id);
      fetchOrders(profile.company_id);

      // Real-time subscription filtrada por empresa
      const channel = supabase
        .channel('orders-changes')
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'orders',
            filter: `company_id=eq.${profile.company_id}` 
          }, 
          () => fetchOrders(profile.company_id)
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    };

    initialize();
  }, [navigate]);

  const fetchOrders = async (cid: string) => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('company_id', cid)
      .order('created_at', { ascending: false });

    if (error) {
      showError("Erro ao carregar pedidos.");
    } else {
      setOrders(data || []);
    }
    setLoading(false);
  };

  const updateStatus = async (id: string, newStatus: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', id);

    if (error) {
      showError("Erro ao atualizar status.");
    } else {
      showSuccess("Status atualizado!");
      if (companyId) fetchOrders(companyId);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const formatPrice = (price: number) => 
    price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <Layout>
      <div className="container py-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-extrabold text-primary flex items-center">
              <Package className="mr-3 h-8 w-8" /> Painel de Pedidos
            </h1>
            {companyId && (
              <div className="flex items-center text-muted-foreground mt-1">
                <Building className="h-4 w-4 mr-1" />
                <span className="text-sm font-medium uppercase tracking-wider">Empresa: {companyId}</span>
              </div>
            )}
          </div>
          <Button variant="outline" onClick={handleLogout} className="rounded-xl">
            <LogOut className="mr-2 h-4 w-4" /> Sair
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <p className="text-muted-foreground animate-pulse">Carregando pedidos da sua empresa...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {orders.length === 0 ? (
              <div className="text-center py-20 bg-secondary/20 rounded-3xl border-2 border-dashed border-primary/20">
                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-20" />
                <p className="text-xl text-muted-foreground">Nenhum pedido recebido para esta empresa.</p>
              </div>
            ) : (
              orders.map((order) => (
                <Card key={order.id} className="border-primary/10 shadow-lg overflow-hidden transition-all hover:shadow-xl">
                  <CardHeader className="bg-secondary/30 flex flex-row justify-between items-center">
                    <div>
                      <CardTitle className="text-xl text-primary">Pedido #{order.id.slice(0, 8)}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.created_at).toLocaleString('pt-BR')}
                      </p>
                    </div>
                    <Badge className={
                      order.status === 'pendente' ? 'bg-yellow-500' : 
                      order.status === 'preparando' ? 'bg-blue-500' : 
                      'bg-green-500'
                    }>
                      {order.status.toUpperCase()}
                    </Badge>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <h4 className="font-bold mb-2 text-foreground">Itens:</h4>
                        <ul className="space-y-1">
                          {order.items.map((item: any, idx: number) => (
                            <li key={idx} className="text-sm flex justify-between">
                              <span>{item.quantity}x {item.name}</span>
                              <span className="font-medium">{formatPrice(item.price * item.quantity)}</span>
                            </li>
                          ))}
                        </ul>
                        <div className="mt-4 pt-2 border-t flex justify-between font-bold text-lg">
                          <span>Total:</span>
                          <span className="text-primary">{formatPrice(order.total)}</span>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-bold text-foreground">Cliente:</h4>
                          <p className="text-sm">{order.customer_name}</p>
                          <p className="text-sm">{order.phone}</p>
                        </div>
                        <div>
                          <h4 className="font-bold text-foreground">Endereço:</h4>
                          <p className="text-sm text-muted-foreground">{order.address}</p>
                        </div>
                        <div className="flex gap-2 pt-4">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => updateStatus(order.id, 'preparando')}
                            disabled={order.status === 'preparando' || order.status === 'entregue'}
                          >
                            <Clock className="mr-2 h-4 w-4" /> Preparar
                          </Button>
                          <Button 
                            size="sm" 
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => updateStatus(order.id, 'entregue')}
                            disabled={order.status === 'entregue'}
                          >
                            <CheckCircle className="mr-2 h-4 w-4" /> Entregue
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AdminDashboard;