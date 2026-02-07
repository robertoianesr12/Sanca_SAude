import React from "react";
import Layout from "@/components/Layout";
import HeroSection from "@/components/HeroSection";
import MenuHighlight from "@/components/MenuHighlight";
import SpecialOffers from "@/components/SpecialOffers";
import TestimonialsCarousel from "@/components/TestimonialsCarousel";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Utensils } from "lucide-react";

const Index = () => {
  return (
    <Layout>
      <HeroSection />
      
      {/* CTA Section after Hero */}
      <section className="py-12 bg-secondary">
        <div className="container text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Pronto para a melhor experiência gastronômica?
          </h2>
          <p className="text-lg text-muted-foreground mb-6">
            Seja para jantar no nosso ambiente acolhedor ou pedir em casa, o TremBão está pronto para te servir.
          </p>
          <div className="flex justify-center gap-4">
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-white text-lg font-semibold rounded-xl shadow-lg">
              <Link to="/order">Reservar Mesa</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-primary text-primary hover:bg-primary/10 text-lg font-semibold rounded-xl">
              <Link to="/menu">Ver Cardápio</Link>
            </Button>
          </div>
        </div>
      </section>

      <MenuHighlight />
      <SpecialOffers />
      <TestimonialsCarousel />
      
      {/* Final CTA */}
      <section className="py-16 bg-card">
        <div className="container text-center">
          <Utensils className="h-10 w-10 mx-auto text-primary mb-4" />
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Experimente o nosso melhor hambúrguer!
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Não perca tempo, faça seu pedido ou reserve sua mesa agora mesmo.
          </p>
          <Button asChild size="xl" className="bg-primary hover:bg-primary/90 text-white text-xl font-extrabold rounded-2xl shadow-2xl transition-transform duration-300 hover:scale-[1.05] px-10 py-7">
            <Link to="/order">
              PEÇA AGORA!
            </Link>
          </Button>
        </div>
      </section>
      
    </Layout>
  );
};

export default Index;