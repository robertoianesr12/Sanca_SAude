import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ShoppingBag, MapPin, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { showSuccess } from "@/utils/toast";

const orderSchema = z.object({
  address: z.string().min(10, { message: "Endereço completo é obrigatório." }),
  phone: z.string().min(8, { message: "Telefone é obrigatório." }),
  paymentMethod: z.enum(["pix", "card", "cash"], { required_error: "Método de pagamento é obrigatório." }),
  notes: z.string().optional(),
});

type OrderFormValues = z.infer<typeof orderSchema>;

const OnlineOrderForm = () => {
  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      address: "",
      phone: "",
      paymentMethod: "card",
      notes: "",
    },
  });

  const onSubmit = (data: OrderFormValues) => {
    console.log("Order Data:", data);
    showSuccess("Seu pedido foi enviado com sucesso! Acompanhe o status por SMS.");
    form.reset();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-6 bg-card rounded-xl shadow-lg border border-primary/10">
        <h3 className="text-2xl font-bold text-primary mb-4">Finalizar Pedido (Carrinho Vazio)</h3>
        
        <div className="bg-secondary p-4 rounded-lg text-center">
            <ShoppingBag className="h-6 w-6 mx-auto text-primary mb-2" />
            <p className="font-medium text-foreground">Seu carrinho está vazio. Por favor, adicione itens pelo <a href="/menu" className="text-primary underline hover:opacity-80">Cardápio</a>.</p>
        </div>

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
          name="paymentMethod"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Método de Pagamento</FormLabel>
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

        <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-foreground text-lg font-semibold rounded-xl shadow-md">
          Finalizar Pedido (R$ 0,00)
        </Button>
      </form>
    </Form>
  );
};

export default OnlineOrderForm;