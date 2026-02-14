import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Clock, ShieldCheck } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-slate-50">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-100/50 via-transparent to-transparent" />
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl" />
      
      <div className="container relative z-10 text-center space-y-12">
        <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-md border border-blue-100 px-5 py-2 rounded-full shadow-sm animate-in fade-in slide-in-from-top duration-1000">
          <ShieldCheck className="h-4 w-4 text-primary" />
          <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Tecnologia & Humanização</span>
        </div>

        <h1 className="text-6xl md:text-9xl font-black text-slate-900 tracking-tighter leading-[0.85] animate-in fade-in zoom-in duration-1000">
          A medicina do futuro,<br />
          <span className="text-primary">hoje em São Carlos.</span>
        </h1>

        <p className="text-xl md:text-2xl text-slate-500 max-w-3xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom duration-1000 delay-200">
          Agendamento inteligente, médicos especialistas e o cuidado que sua família merece com a infraestrutura mais moderna da região.
        </p>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-8 pt-6 animate-in fade-in slide-in-from-bottom duration-1000 delay-300">
          <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-white rounded-3xl px-12 py-8 text-xl font-bold shadow-2xl shadow-primary/30 btn-apple">
            <Link to="/servicos" className="flex items-center">
              Agendar Consulta <ArrowRight className="ml-3 h-6 w-6" />
            </Link>
          </Button>
          <div className="flex items-center space-x-4 text-slate-400">
            <div className="bg-white p-2 rounded-full shadow-sm">
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <span className="text-sm font-semibold">Agendamento em menos de 2 min</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;