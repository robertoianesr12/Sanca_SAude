import React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { Link } from "react-router-dom";

const CartDrawer = ({ children }: { children: React.ReactNode }) => {
  const { items, total, updateQuantity, removeItem } = useCart();

  const formatPrice = (price: number) =>
    price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="w-full sm:max-w-md flex flex-col bg-card">
        <SheetHeader className="border-b pb-4">
          <SheetTitle className="flex items-center text-2xl font-bold text-primary">
            <ShoppingBag className="mr-2 h-6 w-6" /> Seu Carrinho
          </SheetTitle>
        </SheetHeader>

        <div className="flex-grow overflow-y-auto py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
              <ShoppingCart className="h-16 w-16 text-muted-foreground opacity-20" />
              <p className="text-muted-foreground">Seu carrinho está vazio.</p>
              <Button asChild variant="outline" className="rounded-full">
                <Link to="/menu">Ver Cardápio</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 bg-secondary/30 rounded-xl border border-primary/5"
                >
                  <div className="flex-grow">
                    <h4 className="font-bold text-foreground">{item.name}</h4>
                    <p className="text-sm text-primary font-semibold">
                      {formatPrice(item.price)}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center bg-background rounded-full border border-primary/20 p-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-full"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-6 text-center font-bold text-sm">
                        {item.quantity}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-full"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:bg-destructive/10"
                      onClick={() => removeItem(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <SheetFooter className="border-t pt-6 flex-col space-y-4">
            <div className="flex justify-between items-center w-full">
              <span className="text-lg font-medium text-muted-foreground">Total</span>
              <span className="text-2xl font-extrabold text-foreground">
                {formatPrice(total)}
              </span>
            </div>
            <Button asChild className="w-full bg-primary hover:bg-primary/90 text-lg font-bold py-6 rounded-xl shadow-lg">
              <Link to="/checkout">Finalizar Pedido</Link>
            </Button>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CartDrawer;