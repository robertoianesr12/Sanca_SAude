import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { UtensilsCrossed, ChefHat, GlassWater } from "lucide-react";

interface HighlightItem {
  icon: React.ElementType;
  title: string;
  description: string;
  color: string;
}

const highlights: HighlightItem[] = [
  {
    icon: UtensilsCrossed,
    title: "Hambúrgueres Gourmet",
    description: "Nossos blends exclusivos, pães artesanais e molhos secretos. O carro-chefe da casa!",
    color: "text-primary",
  },
  {
    icon: ChefHat,
    title: "Porções de Batata Frita",
    description: "Batatas rústicas, trufadas ou com cheddar e bacon. O acompanhamento perfeito.",
    color: "text-accent",
  },
  {
    icon: GlassWater,
    title: "Caipirinhas Especiais",
    description: "Drinks refrescantes e autorais para harmonizar com seu prato. Happy hour garantido.",
    color: "text-blue-500",
  },
];

const MenuHighlight = () => {
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container text-center">
        <h2 className="text-4xl font-bold text-primary mb-4">Nossos Destaques</h2>
        <p className="text-lg text-muted-foreground mb-12 max-w-3xl mx-auto">
          Conheça os pratos que fazem a fama do TremBão. Qualidade e sabor em cada mordida.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {highlights.map((item, index) => (
            <div 
              key={index} 
              className="p-6 bg-card border border-border/50 rounded-2xl shadow-lg transition-all duration-500 hover:shadow-2xl hover:scale-[1.02] group"
            >
              <item.icon className={`h-12 w-12 mx-auto mb-4 ${item.color} transition-transform duration-500 group-hover:rotate-6`} />
              <h3 className="text-2xl font-semibold mb-2 text-foreground">{item.title}</h3>
              <p className="text-muted-foreground">{item.description}</p>
            </div>
          ))}
        </div>

        <Button asChild size="lg" className="mt-12 bg-accent hover:bg-accent/90 text-foreground text-lg font-semibold rounded-xl shadow-lg transition-transform duration-300 hover:scale-[1.05]">
          <Link to="/menu">
            Ver Cardápio Completo
          </Link>
        </Button>
      </div>
    </section>
  );
};

export default MenuHighlight;