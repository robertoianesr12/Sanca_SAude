import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const HeroSection = () => {
  return (
    <section 
      className="relative h-[80vh] flex items-center justify-center text-center overflow-hidden"
      style={{
        backgroundImage: "url('/placeholder.svg')", // Placeholder for high-quality cinematic image
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed', // Parallax effect placeholder
      }}
    >
      {/* Overlay for cinematic contrast */}
      <div className="absolute inset-0 bg-black/60 backdrop-brightness-75"></div>
      
      <div className="relative z-10 container max-w-4xl p-4 md:p-8">
        <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight mb-4 animate-in fade-in duration-1000">
          TremBão: O Sabor Inesquecível do Gourmet
        </h1>
        <p className="text-xl md:text-2xl text-secondary mb-8 font-medium animate-in fade-in delay-300 duration-1000">
          Experimente a fusão perfeita entre a alta gastronomia e o conforto da comida caseira.
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-white text-lg font-semibold rounded-xl shadow-2xl transition-all duration-300 hover:scale-[1.05]">
            <Link to="/order">
              Garanta sua mesa agora <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="border-2 border-accent text-accent bg-transparent hover:bg-accent/10 text-lg font-semibold rounded-xl transition-all duration-300 hover:scale-[1.05]">
            <Link to="/menu">
              Ver Cardápio
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;