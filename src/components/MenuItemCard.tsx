import React from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Star } from "lucide-react";

interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  category: 'hamburguer' | 'porcao' | 'bebida' | 'vegano' | 'prato';
  isPopular: boolean;
}

interface MenuItemCardProps {
  item: MenuItem;
}

const MenuItemCard: React.FC<MenuItemCardProps> = ({ item }) => {
  const formatPrice = (price: number) => 
    price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <Card className="overflow-hidden rounded-2xl shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-[1.01] border-primary/20">
      <div className="relative h-48 bg-secondary flex items-center justify-center">
        {/* Placeholder for vibrant image */}
        <img 
          src="/placeholder.svg" 
          alt={item.name} 
          className="w-full h-full object-cover opacity-50"
        />
        <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-3xl font-extrabold text-primary/80">{item.category.toUpperCase()}</span>
        </div>
        
        {item.isPopular && (
          <Badge className="absolute top-4 right-4 bg-accent text-primary font-bold rounded-full px-3 py-1 flex items-center">
            <Star className="h-4 w-4 mr-1 fill-primary" /> Popular
          </Badge>
        )}
      </div>
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-primary">{item.name}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-muted-foreground text-sm mb-4 min-h-12">{item.description}</p>
      </CardContent>
      <CardFooter className="flex justify-between items-center pt-0">
        <span className="text-3xl font-extrabold text-foreground">
          {formatPrice(item.price)}
        </span>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-transform duration-200 hover:scale-[1.05]">
          <ShoppingCart className="h-4 w-4 mr-2" /> Adicionar
        </Button>
      </CardFooter>
    </Card>
  );
};

export default MenuItemCard;