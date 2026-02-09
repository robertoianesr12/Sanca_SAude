import React from "react";
import Layout from "@/components/Layout";
import OnlineOrderForm from "@/components/OnlineOrderForm";
import { ShoppingBag, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Checkout = () => {
  return (
    <Layout>
      <div className="container py-16 max-w-4xl">
        <div className="flex items-center justify-between mb-8">
            <Button asChild variant="ghost" className="text-muted-foreground hover:text-primary">
                <Link to="/menu">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Voltar ao Cardápio
                </Link>
            </Button>
            <h1 className="text-4xl font-extrabold text-primary flex items-center">
                <ShoppingBag className="mr-3 h-8 w-8" /> Finalizar Pedido
            </h1>
            <div className="w-24"></div> {/* Spacer for centering */}
        </div>
        
        <div className="bg-card rounded-3xl shadow-2xl overflow-hidden border border-primary/10">
            <div className="p-1 bg-gradient-to-r from-primary via-accent to-primary"></div>
            <div className="p-8">
                <OnlineOrderForm />
            </div>
        </div>
      </div>
    </Layout>
  );
};

export default Checkout;