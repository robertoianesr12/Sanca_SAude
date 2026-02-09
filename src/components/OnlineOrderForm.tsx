import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ShoppingBag, MapPin, CreditCard, Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { showSuccess, showError } from "@/utils/toast";
import { useCart } from "@/context/CartContext";
import { useNavigate } from "react-router-dom";

const orderSchema = z.object({
  address: z.string().min(10, { message: "Endereço completo é obrigatório." }),
  phone: z.string().min(8, { message: "Telefone é obrigatório." }),
  paymentMethod: z.enum(["pix", "card", "cash"], { required_error: "Método de pagamento é obrigatório." }),
  notes: z.string().optional(),
});

type OrderFormValues = z.infer<typeof orderSchema>;

const OnlineOrderForm = () => {
  const { items, total, updateQuantity, removeItem, clearCart } = useCart();
  const navigate = useNavigate();

  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      address: "",
      phone: "",
      paymentMethod: "card",
      notes: "",
    },
  });

  const formatPrice = (price: number) => 
    price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const onSubmit = (data: OrderFormValues) => {
    if (items.length === 0) {
        showError("Seu carrinho está vazio. Adicione itens antes de finalizar o pedido.");
        return;
    }
    
    console.log("Order Data:", data, "Total:", total);
    showSuccess(`Pedido de ${formatPrice(total)} enviado com sucesso! Acompanhe o status por SMS.`);
    clearCart();
    form.reset();
    navigate("/");
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        
        {/* Cart Summary Section */}
        <div className="space-y-4 p-6 border-2 border-primary/20 rounded-2xl bg-secondary/30 shadow-inner">
            <h4 className="text-2xl font-bold text-primary flex items-center">
                <ShoppingBag className="h-6 w-6 mr-2" /> Resumo do Pedido
            </h4>
            
            {items.length === 0 ? (
                <div className="text-center py-8">
                    <p className="text-lg text-muted-foreground mb-4">Seu carrinho está vazio no momento.</p>
                    <Button type="button" onClick={() => navigate("/menu")} variant="outline" className="rounded-full border-primary text-primary">
                        Ir para o Cardápio
                    </Button>
                </div>
            ) : (
                <div className="space-y-4">
                    {items.map(item => (
                        <div key={item.id} className="flex items-center justify-between bg-card p-3 rounded-xl shadow-sm border border-border/50">
                            <div className="flex-grow">
                                <p className="font-bold text-foreground">{item.name}</p>
                                <p className="text-sm text-primary font-medium">{formatPrice(item.price)} cada</p>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className="flex items-center bg-secondary rounded-full p-1">
                                    <Button 
                                        type="button" 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-8 w-8 rounded-full"
                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                    >
                                        <Minus className="h-4 w-4" />
                                    </Button>
                                    <span className="font-bold w-6 text-center">{item.quantity}</span>
                                    <Button 
                                        type="button" 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-8 w-8 rounded-full"
                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                    >
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                                <Button 
                                    type="button" 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                    onClick={() => removeItem(item.id)}
                                >
                                    <Trash2 className="h-5 w-5" />
                                </Button>
                            </div>
                        </div>
                    ))}
                    <div className="flex justify-between pt-4 border-t-2 border-primary/10 mt-4">
                        <span className="text-2xl font-bold text-primary">Total a Pagar:</span>
                        <span className="text-2xl font-extrabold text-foreground">{formatPrice(total)}</span>
                    </div>
                </div>
            )}
        </div>
        
        {items.length > 0 && (
            <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                    <div className="space-y-6">
                        <h4 className="text-xl font-semibold text-primary border-b pb-2">Dados de Entrega</h4>
                        <FormField
                            control={form.control}
                            name="address"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Endereço Completo</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Textarea placeholder="Rua, número, bairro, cidade e ponto de referência" {...field} className="pl-10 rounded-xl min-h-[100px]" />
                                    </div>
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Telefone de Contato</FormLabel>
                                <FormControl>
                                    <Input placeholder="(11) 98765-4321" type="tel" {...field} className="rounded-xl h-12" />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="space-y-6">
                        <h4 className="text-xl font-semibold text-primary border-b pb-2">Pagamento & Notas</h4>
                        <FormField
                            control={form.control}
                            name="paymentMethod"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Forma de Pagamento</FormLabel>
                                <FormControl>
                                    <div className="grid grid-cols-3 gap-2">
                                        {['pix', 'card', 'cash'].map((method) => (
                                            <Button 
                                                key={method}
                                                type="button" 
                                                variant={field.value === method ? 'default' : 'outline'} 
                                                onClick={() => field.onChange(method)}
                                                className={`rounded-xl h-12 capitalize ${field.value === method ? 'bg-primary' : 'border-primary/30 text-primary'}`}
                                            >
                                                {method === 'pix' ? 'PIX' : method === 'card' ? 'Cartão' : 'Dinheiro'}
                                            </Button>
                                        ))}
                                    </div>
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Observações do Pedido</FormLabel>
                                <FormControl>
                                    <Textarea placeholder="Ex: Retirar cebola, trocar molho..." {...field} className="rounded-xl min-h-[80px]" />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-primary font-extrabold text-2xl rounded-2xl shadow-2xl transition-all duration-300 hover:scale-[1.02] py-10 mt-8">
                    FINALIZAR PEDIDO ({formatPrice(total)})
                </Button>
            </>
        )}
      </form>
    </Form>
  );
};

export default OnlineOrderForm;