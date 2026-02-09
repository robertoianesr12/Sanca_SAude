import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, Utensils, ShoppingCart } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import CartDrawer from "./CartDrawer";

const navItems = [
  { name: "Cardápio", href: "/menu" },
  { name: "Reservas & Pedidos", href: "/order" },
  { name: "Avaliações", href: "/#reviews" },
  { name: "Contato", href: "/contact" },
];

const Header = () => {
  const { items } = useCart();
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between px-4 md:px-8">
        {/* Logo/Brand */}
        <Link to="/" className="flex items-center space-x-2">
          <Utensils className="h-6 w-6 text-primary" />
          <span className="inline-block font-bold text-xl tracking-wider text-primary">
            TremBão
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary/80 text-foreground",
                item.href.startsWith("/#") && "text-accent hover:text-accent/80"
              )}
            >
              {item.name}
            </Link>
          ))}
          
          {/* Cart Button */}
          <CartDrawer>
            <Button variant="ghost" size="icon" className="relative hover:bg-primary/10">
              <ShoppingCart className="h-5 w-5 text-primary" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-accent text-primary text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full border-2 border-background">
                  {totalItems}
                </span>
              )}
            </Button>
          </CartDrawer>

          <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg shadow-lg transition-transform duration-300 hover:scale-[1.02]">
            <Link to="/order">Peça Agora!</Link>
          </Button>
        </nav>

        {/* Mobile Navigation */}
        <div className="flex items-center space-x-2 md:hidden">
          <CartDrawer>
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart className="h-5 w-5 text-primary" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-accent text-primary text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full border-2 border-background">
                  {totalItems}
                </span>
              )}
            </Button>
          </CartDrawer>
          
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px] bg-secondary/95">
              <div className="flex flex-col space-y-4 pt-6">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="text-lg font-semibold text-foreground hover:text-primary transition-colors"
                  >
                    {item.name}
                  </Link>
                ))}
                <Button asChild className="mt-4 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg">
                  <Link to="/order">Peça Agora!</Link>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;