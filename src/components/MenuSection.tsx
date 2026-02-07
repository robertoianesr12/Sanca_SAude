import React, { useState, useMemo } from "react";
import MenuItemCard from "./MenuItemCard";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Search, UtensilsCrossed, ChefHat, GlassWater, Leaf, Star } from "lucide-react";

type Category = 'todos' | 'hamburguer' | 'porcao' | 'bebida' | 'vegano' | 'prato';

interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  category: 'hamburguer' | 'porcao' | 'bebida' | 'vegano' | 'prato';
  isPopular: boolean;
}

const mockMenu: MenuItem[] = [
  { id: 1, name: "TremBão Clássico", description: "Blend de 180g, queijo cheddar, bacon crocante, maionese da casa e pão brioche.", price: 35.90, category: 'hamburguer', isPopular: true },
  { id: 2, name: "Costelinha BBQ", description: "Costelinha suína defumada com molho barbecue artesanal, servida com purê de batata doce.", price: 58.00, category: 'prato', isPopular: true },
  { id: 3, name: "Parmegiana Gourmet", description: "Filé mignon à parmegiana, molho de tomate fresco e queijo gratinado. Acompanha arroz e fritas.", price: 62.50, category: 'prato', isPopular: true },
  { id: 4, name: "Batata Frita Trufada", description: "Batatas rústicas com azeite trufado e queijo parmesão ralado.", price: 28.00, category: 'porcao', isPopular: true },
  { id: 5, name: "Caipirinha de Maracujá", description: "Cachaça premium, maracujá fresco e toque de pimenta.", price: 22.00, category: 'bebida', isPopular: false },
  { id: 6, name: "Veggie Burger", description: "Hambúrguer de grão de bico e beterraba, pão integral, alface, tomate e molho pesto vegano.", price: 38.90, category: 'vegano', isPopular: false },
  { id: 7, name: "Mega Combo Família", description: "Dois hambúrgueres, uma porção grande de fritas e 4 bebidas. Opção ideal para grupos.", price: 120.00, category: 'porcao', isPopular: false },
  { id: 8, name: "Salada Fresca", description: "Mix de folhas, tomate cereja, queijo de cabra e vinagrete de mostarda e mel.", price: 32.00, category: 'vegano', isPopular: false },
];

const categories: { value: Category, label: string, icon: React.ElementType }[] = [
  { value: 'todos', label: 'Todos', icon: UtensilsCrossed },
  { value: 'hamburguer', label: 'Hambúrgueres', icon: ChefHat },
  { value: 'prato', label: 'Pratos Principais', icon: UtensilsCrossed },
  { value: 'porcao', label: 'Porções & Combos', icon: Star },
  { value: 'bebida', label: 'Bebidas', icon: GlassWater },
  { value: 'vegano', label: 'Veganos', icon: Leaf },
];

const MenuSection = () => {
  const [selectedCategory, setSelectedCategory] = useState<Category>('todos');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredMenu = useMemo(() => {
    let items = mockMenu;

    if (selectedCategory !== 'todos') {
      items = items.filter(item => item.category === selectedCategory);
    }

    if (searchTerm) {
      const lowerCaseSearch = searchTerm.toLowerCase();
      items = items.filter(item => 
        item.name.toLowerCase().includes(lowerCaseSearch) || 
        item.description.toLowerCase().includes(lowerCaseSearch)
      );
    }

    return items;
  }, [selectedCategory, searchTerm]);

  return (
    <section className="bg-secondary/30 py-12 rounded-3xl shadow-inner">
      <div className="container">
        {/* Search and Filter Controls */}
        <div className="mb-10 space-y-6">
          <div className="relative max-w-lg mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Buscar prato, ingrediente ou promoção..."
              className="pl-10 h-12 rounded-xl border-primary/30 focus:border-primary transition-colors"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex justify-center overflow-x-auto pb-2">
            <ToggleGroup 
              type="single" 
              value={selectedCategory} 
              onValueChange={(value: Category) => setSelectedCategory(value)}
              className="space-x-3"
            >
              {categories.map((cat) => (
                <ToggleGroupItem 
                  key={cat.value} 
                  value={cat.value} 
                  aria-label={`Filtrar por ${cat.label}`}
                  className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground rounded-full px-4 py-2 text-sm font-medium transition-all hover:bg-primary/10 hover:text-primary border border-primary/20"
                >
                  <cat.icon className="h-4 w-4 mr-2" />
                  {cat.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredMenu.length > 0 ? (
            filteredMenu.map((item) => (
              <MenuItemCard key={item.id} item={item} />
            ))
          ) : (
            <div className="col-span-full text-center py-10">
              <p className="text-xl text-muted-foreground">Nenhum item encontrado para esta busca/categoria.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default MenuSection;