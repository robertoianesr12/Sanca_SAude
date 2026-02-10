import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { showSuccess, showError } from "@/utils/toast";
import { useNavigate } from "react-router-dom";
import { Package, Clock, CheckCircle, LogOut } from "lucide-react";

interface Order {
  id: string;
  customer_name: string;
  phone: string;
  address: string;
  items: any[];
  total: number;
  status: string;
  created_at: string;
}

const AdminDashboard = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkUser();
    fetchOrders();

    // Real-time subscription
    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        fetchOrders();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/login");
    }
  };

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
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
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-extrabold text-primary flex items-center">
            <Package className="mr-3 h-8 w-8" /> Painel de Pedidos
          </h1>
          <Button variant="outline" onClick={handleLogout} className="rounded-xl">
            <LogOut className="mr-2 h-4 w-4" /> Sair
          </Button>
        </div>

        {loading ? (
          <p className="text-center text-muted-foreground">Carregando pedidos...</p>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {orders.length === 0 ? (
              <p className="text-center text-muted-foreground py-12">Nenhum pedido recebido ainda.</p>
            ) : (
              orders.map((order) => (
                <Card key={order.id} className="border-primary/10 shadow-lg overflow-hidden">
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
                          <p className="text-sm">{order.customer_name || 'Não informado'}</p>
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
                            disabled={order.status === 'preparando'}
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