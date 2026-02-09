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

const orderSchema = z.object({
  address: z.string().min(10, { message: "Endereço completo é obrigatório." }),
  phone: z.string().min(8, { message: "Telefone é obrigatório." }),
  paymentMethod: z.enum(["pix", "card", "cash"], { required_error: "Método de pagamento é obrigatório." }),
  notes: z.string().optional(),
});

type OrderFormValues = z.infer<typeof orderSchema>;

const OnlineOrderForm = () => {
  const { items, total, updateQuantity, removeItem, clearCart } = useCart();

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
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-6 bg-card rounded-xl shadow-lg border border-primary/10">
        <h3 className="text-2xl font-bold text-primary mb-6">Finalizar Pedido Online</h3>
        
        {/* Cart Summary */}
        <div className="space-y-4 p-4 border border-secondary rounded-xl bg-secondary/50">
            <h4 className="text-xl font-semibold text-foreground flex items-center">
                <ShoppingBag className="h-5 w-5 mr-2 text-primary" /> Seu Carrinho ({items.length} itens)
            </h4>
            
            {items.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                    <p>Seu carrinho está vazio. Adicione itens pelo <a href="/menu" className="text-primary underline hover:opacity-80">Cardápio</a>.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {items.map(item => (
                        <div key={item.id} className="flex items-center justify-between border-b pb-2 last:border-b-0 last:pb-0">
                            <div className="flex-grow">
                                <p className="font-medium text-sm text-foreground">{item.name}</p>
                                <p className="text-xs text-muted-foreground">{formatPrice(item.price)} x {item.quantity}</p>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Button 
                                    type="button" 
                                    variant="outline" 
                                    size="icon" 
                                    className="h-6 w-6 rounded-full"
                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                >
                                    <Minus className="h-3 w-3" />
                                </Button>
                                <span className="font-bold w-4 text-center">{item.quantity}</span>
                                <Button 
                                    type="button" 
                                    variant="outline" 
                                    size="icon" 
                                    className="h-6 w-6 rounded-full"
                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                >
                                    <Plus className="h-3 w-3" />
                                </Button>
                                <Button 
                                    type="button" 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-6 w-6 text-destructive hover:bg-destructive/10"
                                    onClick={() => removeItem(item.id)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                    <div className="flex justify-between pt-4 border-t border-primary/30">
                        <span className="text-xl font-bold text-primary">Total:</span>
                        <span className="text-xl font-extrabold text-foreground">{formatPrice(total)}</span>
                    </div>
                </div>
            )}
        </div>
        
        {/* Delivery Details */}
        <h4 className="text-xl font-semibold text-primary pt-4">Detalhes da Entrega</h4>

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Endereço de Entrega</FormLabel>
              <FormControl>
                <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Textarea placeholder="Rua, número, bairro e complemento" {...field} className="pl-10 rounded-lg" rows={3} />
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
              <FormLabel>Telefone</FormLabel>
              <FormControl>
                <Input placeholder="(11) 9XXXX-XXXX" type="tel" {...field} className="rounded-lg" />
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
              <FormLabel>Observações (Opcional)</FormLabel>
              <FormControl>
                <Textarea placeholder="Ex: Sem cebola, maionese extra..." {...field} className="rounded-lg min-h-[80px]" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Payment Method */}
        <h4 className="text-xl font-semibold text-primary pt-4">Método de Pagamento</h4>
        <FormField
          control={form.control}
          name="paymentMethod"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="sr-only">Método de Pagamento</FormLabel>
              <FormControl>
                <div className="flex space-x-4">
                    <Button 
                        type="button" 
                        variant={field.value === 'pix' ? 'default' : 'outline'} 
                        onClick={() => field.onChange('pix')}
                        className={field.value === 'pix' ? 'bg-primary hover:bg-primary/90' : 'border-primary text-primary hover:bg-primary/10'}
                    >
                        PIX
                    </Button>
                    <Button 
                        type="button" 
                        variant={field.value === 'card' ? 'default' : 'outline'} 
                        onClick={() => field.onChange('card')}
                        className={field.value === 'card' ? 'bg-primary hover:bg-primary/90' : 'border-primary text-primary hover:bg-primary/10'}
                    >
                        Cartão
                    </Button>
                    <Button 
                        type="button" 
                        variant={field.value === 'cash' ? 'default' : 'outline'} 
                        onClick={() => field.onChange('cash')}
                        className={field.value === 'cash' ? 'bg-primary hover:bg-primary/90' : 'border-primary text-primary hover:bg-primary/10'}
                    >
                        Dinheiro
                    </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-primary font-bold text-xl rounded-2xl shadow-xl transition-transform duration-300 hover:scale-[1.01] py-7">
          Finalizar Pedido ({formatPrice(total)})
        </Button>
      </form>
    </Form>
  );
};

export default OnlineOrderForm;