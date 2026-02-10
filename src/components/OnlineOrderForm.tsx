import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ShoppingBag, MapPin, CreditCard, Minus, Plus, Trash2, Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { showSuccess, showError } from "@/utils/toast";
import { useCart } from "@/context/CartContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const orderSchema = z.object({
  name: z.string().min(2, { message: "Nome é obrigatório." }),
  cep: z.string().min(8, { message: "CEP deve ter 8 dígitos." }).max(9),
  street: z.string().min(3, { message: "Rua é obrigatória." }),
  number: z.string().min(1, { message: "Número é obrigatório." }),
  complement: z.string().optional(),
  neighborhood: z.string().min(2, { message: "Bairro é obrigatório." }),
  city: z.string().min(2, { message: "Cidade é obrigatória." }),
  state: z.string().length(2, { message: "UF inválida." }),
  phone: z.string().min(8, { message: "Telefone é obrigatório." }),
  paymentMethod: z.enum(["pix", "card", "cash"], { required_error: "Método de pagamento é obrigatório." }),
  notes: z.string().optional(),
});

type OrderFormValues = z.infer<typeof orderSchema>;

const OnlineOrderForm = () => {
  const { items, total, updateQuantity, removeItem, clearCart } = useCart();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      name: "",
      cep: "",
      street: "",
      number: "",
      complement: "",
      neighborhood: "",
      city: "",
      state: "",
      phone: "",
      paymentMethod: "card",
      notes: "",
    },
  });

  const { setValue, watch } = form;
  const cepValue = watch("cep");

  useEffect(() => {
    const fetchAddress = async (cep: string) => {
      const cleanCep = cep.replace(/\D/g, "");
      if (cleanCep.length === 8) {
        try {
          const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
          const data = await response.json();
          if (data.erro) {
            showError("CEP não encontrado.");
            return;
          }
          setValue("street", data.logradouro);
          setValue("neighborhood", data.bairro);
          setValue("city", data.localidade);
          setValue("state", data.uf);
          showSuccess("Endereço preenchido automaticamente!");
        } catch (error) {
          showError("Erro ao buscar CEP.");
        }
      }
    };
    fetchAddress(cepValue);
  }, [cepValue, setValue]);

  const formatPrice = (price: number) => 
    price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const onSubmit = async (data: OrderFormValues) => {
    if (items.length === 0) {
        showError("Seu carrinho está vazio.");
        return;
    }
    
    setIsSubmitting(true);
    const fullAddress = `${data.street}, ${data.number} ${data.complement ? `- ${data.complement}` : ""} - ${data.neighborhood}, ${data.city}/${data.state}`;
    
    const { error } = await supabase
      .from('orders')
      .insert({
        customer_name: data.name,
        phone: data.phone,
        address: fullAddress,
        items: items,
        total: total,
        payment_method: data.paymentMethod,
        notes: data.notes,
        status: 'pendente'
      });

    if (error) {
      showError("Erro ao enviar pedido. Tente novamente.");
      console.error(error);
    } else {
      showSuccess(`Pedido enviado com sucesso!`);
      clearCart();
      form.reset();
      navigate("/");
    }
    setIsSubmitting(false);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Resumo do Pedido */}
        <div className="space-y-4 p-6 border-2 border-primary/20 rounded-2xl bg-secondary/30 shadow-inner">
            <h4 className="text-2xl font-bold text-primary flex items-center">
                <ShoppingBag className="h-6 w-6 mr-2" /> Resumo do Pedido
            </h4>
            
            {items.length === 0 ? (
                <div className="text-center py-8">
                    <p className="text-lg text-muted-foreground mb-4">Seu carrinho está vazio.</p>
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
                                    <Button type="button" variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                                        <Minus className="h-4 w-4" />
                                    </Button>
                                    <span className="font-bold w-6 text-center">{item.quantity}</span>
                                    <Button type="button" variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                                <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => removeItem(item.id)}>
                                    <Trash2 className="h-5 w-5" />
                                </Button>
                            </div>
                        </div>
                    ))}
                    <div className="flex justify-between pt-4 border-t-2 border-primary/10 mt-4">
                        <span className="text-2xl font-bold text-primary">Total:</span>
                        <span className="text-2xl font-extrabold text-foreground">{formatPrice(total)}</span>
                    </div>
                </div>
            )}
        </div>
        
        {items.length > 0 && (
            <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                    <div className="space-y-6">
                        <h4 className="text-xl font-semibold text-primary border-b pb-2 flex items-center">
                            <MapPin className="h-5 w-5 mr-2" /> Dados de Entrega
                        </h4>
                        
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nome Completo</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Seu Nome" {...field} className="rounded-xl h-12" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="cep"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>CEP</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                <Input placeholder="00000-000" {...field} className="pl-10 rounded-xl h-12" maxLength={9} />
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
                                            <Input placeholder="(11) 98765-4321" type="tel" {...field} className="rounded-xl h-12" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="street"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Rua</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Rua das Flores" {...field} className="rounded-xl h-12" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-3 gap-4">
                            <FormField
                                control={form.control}
                                name="number"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Número</FormLabel>
                                        <FormControl>
                                            <Input placeholder="123" {...field} className="rounded-xl h-12" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="complement"
                                render={({ field }) => (
                                    <FormItem className="col-span-2">
                                        <FormLabel>Complemento</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Apto, Bloco, etc." {...field} className="rounded-xl h-12" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>

                    <div className="space-y-6">
                        <h4 className="text-xl font-semibold text-primary border-b pb-2 flex items-center">
                            <CreditCard className="h-5 w-5 mr-2" /> Pagamento & Notas
                        </h4>
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
                                <FormLabel>Observações</FormLabel>
                                <FormControl>
                                    <Textarea placeholder="Ex: Retirar cebola..." {...field} className="rounded-xl min-h-[120px]" />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-accent hover:bg-accent/90 text-primary font-extrabold text-2xl rounded-2xl shadow-2xl transition-all duration-300 hover:scale-[1.02] py-10 mt-8"
                >
                    {isSubmitting ? <Loader2 className="animate-spin h-8 w-8" /> : `FINALIZAR PEDIDO (${formatPrice(total)})`}
                </Button>
            </>
        )}
      </form>
    </Form>
  );
};

export default OnlineOrderForm;