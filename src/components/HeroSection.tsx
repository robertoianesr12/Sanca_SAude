import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Clock, ShieldCheck } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden bg-slate-50">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-100/50 via-transparent to-transparent" />
      
      <div className="container relative z-10 text-center space-y-10">
        <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-md border border-blue-100 px-4 py-2 rounded-full shadow-sm animate-in fade-in slide-in-from-top duration-1000">
          <ShieldCheck className="h-4 w-4 text-primary" />
          <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Tecnologia & Humanização</span>
        </div>

        <h1 className="text-6xl md:text-8xl font-black text-slate-900 tracking-tighter leading-[0.9] animate-in fade-in zoom-in duration-1000">
          A medicina do futuro,<br />
          <span className="text-primary">hoje em São Carlos.</span>
        </h1>

        <p className="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom duration-1000 delay-200">
          Agendamento inteligente, médicos especialistas e o cuidado que sua família merece com a infraestrutura mais moderna da região.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-6 pt-4 animate-in fade-in slide-in-from-bottom duration-1000 delay-300">
          <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-white rounded-2xl px-10 py-8 text-xl font-bold shadow-2xl shadow-primary/30 transition-all hover:scale-105">
            <Link to="/servicos">Agendar Consulta <ArrowRight className="ml-3 h-6 w-6" /></Link>
          </Button>
          <div className="flex items-center justify-center space-x-4 text-slate-400">
            <Clock className="h-5 w-5" />
            <span className="text-sm font-medium">Agendamento em menos de 2 min</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;