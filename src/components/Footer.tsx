import React from "react";
import { Link } from "react-router-dom";
import { Activity, MapPin, Phone, Mail } from "lucide-react";
import { MadeWithDyad } from "./made-with-dyad";

const Footer = () => {
  return (
    <footer className="border-t bg-white pt-16 pb-8">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center space-x-2 mb-6">
              <Activity className="h-8 w-8 text-primary" />
              <span className="font-black text-2xl tracking-tighter text-slate-900">
                SANCA<span className="text-primary">SAÚDE</span>
              </span>
            </Link>
            <p className="text-slate-500 leading-relaxed">
              Excelência médica e tecnologia de ponta para o cuidado da sua saúde em São Carlos.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 mb-6">Navegação</h4>
            <ul className="space-y-4 text-slate-500">
              <li><Link to="/servicos" className="hover:text-primary transition-colors">Especialidades</Link></li>
              <li><Link to="/portal" className="hover:text-primary transition-colors">Portal do Paciente</Link></li>
              <li><Link to="/login" className="hover:text-primary transition-colors">Acesso Restrito</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 mb-6">Horários</h4>
            <ul className="space-y-4 text-slate-500">
              <li>Seg - Sex: 07:00 - 20:00</li>
              <li>Sábado: 08:00 - 12:00</li>
              <li>Domingo: Fechado</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 mb-6">Contato</h4>
            <div className="space-y-4 text-slate-500">
              <div className="flex items-center">
                <MapPin className="h-5 w-5 mr-3 text-primary" />
                <span>Av. São Carlos, 1000, Centro</span>
              </div>
              <div className="flex items-center">
                <Phone className="h-5 w-5 mr-3 text-primary" />
                <span>(16) 3333-4444</span>
              </div>
              <div className="flex items-center">
                <Mail className="h-5 w-5 mr-3 text-primary" />
                <span>contato@sancasaude.com.br</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-16 pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-400 text-sm">
            &copy; {new Date().getFullYear()} Sanca Saúde. Todos os direitos reservados.
          </p>
          <MadeWithDyad />
        </div>
      </div>
    </footer>
  );
};

export default Footer;