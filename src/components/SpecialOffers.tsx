import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Timer, Gift } from "lucide-react";

const SpecialOffers = () => {
  return (
    <section className="py-16 md:py-24 bg-primary/10">
      <div className="container">
        <div className="bg-primary text-primary-foreground p-8 md:p-12 rounded-3xl shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="flex items-center">
            <Gift className="h-12 w-12 mr-4 text-accent animate-pulse" />
            <div>
              <h2 className="text-3xl md:text-4xl font-extrabold mb-2">
                Oferta Especial do Dia!
              </h2>
              <p className="text-lg font-medium opacity-90">
                Combo Duplo TremBão com 20% de desconto. Válido apenas hoje!
              </p>
            </div>
          </div>
          
          <div className="flex flex-col items-center lg:items-end">
            <div className="flex items-center mb-4 bg-primary-foreground/10 p-2 rounded-full">
                <Timer className="h-5 w-5 mr-2 text-accent" />
                <span className="text-lg font-bold text-accent">
                    Faltam 03:45:22
                </span>
            </div>
            <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-primary font-bold text-lg rounded-xl shadow-xl transition-transform duration-300 hover:scale-[1.05]">
              <Link to="/order">
                Peça agora e aproveite o desconto!
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SpecialOffers;