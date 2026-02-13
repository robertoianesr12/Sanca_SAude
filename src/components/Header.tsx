import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Activity, Calendar } from "lucide-react";

const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/20 bg-white/60 backdrop-blur-xl">
      <div className="container flex h-20 items-center justify-between">
        <Link to="/" className="flex items-center space-x-2 group">
          <div className="bg-primary p-2 rounded-xl group-hover:rotate-12 transition-transform">
            <Activity className="h-6 w-6 text-white" />
          </div>
          <span className="font-black text-2xl tracking-tighter text-slate-900">SANCA<span className="text-primary">SAÚDE</span></span>
        </Link>

        <nav className="hidden md:flex items-center space-x-8">
          <Link to="/servicos" className="text-sm font-semibold text-slate-600 hover:text-primary transition-colors">Especialidades</Link>
          <Link to="/portal" className="text-sm font-semibold text-slate-600 hover:text-primary transition-colors">Portal do Paciente</Link>
          <Button asChild className="bg-primary hover:bg-primary/90 rounded-2xl px-6 py-6 shadow-lg shadow-primary/20 btn-pulse">
            <Link to="/servicos">
              <Calendar className="mr-2 h-4 w-4" /> Agendar Agora
            </Link>
          </Button>
        </nav>
      </div>
    </header>
  );
};

export default Header;