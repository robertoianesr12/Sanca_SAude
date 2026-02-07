import React from "react";
import { Link } from "react-router-dom";
import { Utensils, MapPin, Phone, Mail } from "lucide-react";
import { MadeWithDyad } from "./made-with-dyad";

const Footer = () => {
  return (
    <footer className="border-t bg-card text-card-foreground pt-12 pb-4">
      <div className="container max-w-screen-2xl px-4 md:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <Utensils className="h-8 w-8 text-primary" />
              <span className="inline-block font-extrabold text-2xl tracking-wider text-primary">
                TremBão
              </span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs">
              O melhor hambúrguer gourmet com gostinho de comida caseira.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-primary">Navegação</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/menu" className="text-muted-foreground hover:text-primary transition-colors">Cardápio</Link></li>
              <li><Link to="/order" className="text-muted-foreground hover:text-primary transition-colors">Reservas</Link></li>
              <li><Link to="/contact" className="text-muted-foreground hover:text-primary transition-colors">Fale Conosco</Link></li>
              <li><Link to="/#reviews" className="text-muted-foreground hover:text-primary transition-colors">Avaliações</Link></li>
            </ul>
          </div>

          {/* Horários */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-primary">Horário de Funcionamento</h4>
            <p className="text-sm text-muted-foreground">Seg - Qui: 18:00 - 23:00</p>
            <p className="text-sm text-muted-foreground">Sex - Sáb: 18:00 - 01:00</p>
            <p className="text-sm text-muted-foreground">Dom: Fechado</p>
          </div>

          {/* Contato */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-primary">Contato</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center text-muted-foreground">
                <MapPin className="h-4 w-4 mr-2 text-accent" />
                <span>Rua Gourmet, 123, São Paulo - SP</span>
              </div>
              <div className="flex items-center text-muted-foreground">
                <Phone className="h-4 w-4 mr-2 text-accent" />
                <span>(11) 98765-4321</span>
              </div>
              <div className="flex items-center text-muted-foreground">
                <Mail className="h-4 w-4 mr-2 text-accent" />
                <span>contato@trembao.com.br</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-12 border-t pt-4 flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} TremBão. Todos os direitos reservados.</p>
          <MadeWithDyad />
        </div>
      </div>
    </footer>
  );
};

export default Footer;