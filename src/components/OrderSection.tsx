import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ReservationForm from "./ReservationForm";
import OnlineOrderForm from "./OnlineOrderForm";
import { CalendarCheck, ShoppingCart } from "lucide-react";
import { useCart } from "@/context/CartContext";

const OrderSection = () => {
  const { clearCart } = useCart();

  return (
    <section className="container max-w-4xl py-8">
      <Tabs 
        defaultValue="reservation" 
        className="w-full"
        onValueChange={(value) => {
            if (value === "reservation") {
                clearCart();
            }
        }}
      >
        <TabsList className="grid w-full grid-cols-2 h-auto p-1 bg-secondary rounded-xl shadow-inner">
          <TabsTrigger 
            value="reservation" 
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg py-3 text-base font-semibold transition-all"
          >
            <CalendarCheck className="h-5 w-5 mr-2" /> Reservar Mesa
          </TabsTrigger>
          <TabsTrigger 
            value="order" 
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg py-3 text-base font-semibold transition-all"
          >
            <ShoppingCart className="h-5 w-5 mr-2" /> Pedido Online
          </TabsTrigger>
        </TabsList>
        
        <div className="mt-8">
            <TabsContent value="reservation">
                <ReservationForm />
            </TabsContent>
            <TabsContent value="order">
                <OnlineOrderForm />
            </TabsContent>
        </div>
      </Tabs>
    </section>
  );
};

export default OrderSection;