import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Heart, Shield, Clock, ArrowRight, Activity } from "lucide-react";

const ClinicIndex = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-transparent z-0" />
        <div className="container relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 animate-in fade-in slide-in-from-left duration-1000">
            <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-bold">
              <Activity className="h-4 w-4" />
              <span>Excelência em Saúde em São Carlos</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Cuidar de você é nossa <span className="text-blue-600">maior missão.</span>
            </h1>
            <p className="text-xl text-slate-600 max-w-lg leading-relaxed">
              Tecnologia de ponta e atendimento humanizado para garantir o bem-estar da sua família na Clínica Sanca Saúde.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl px-8 py-7 text-lg shadow-xl transition-all hover:scale-105">
                <Link to="/login">Agendar Consulta <ArrowRight className="ml-2 h-5 w-5" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-2 border-blue-200 text-blue-600 rounded-2xl px-8 py-7 text-lg hover:bg-blue-50 transition-all">
                <Link to="/servicos">Nossos Serviços</Link>
              </Button>
            </div>
          </div>
          <div className="hidden lg:block relative animate-in fade-in zoom-in duration-1000">
            <div className="w-full h-[600px] bg-blue-100 rounded-[4rem] overflow-hidden shadow-2xl rotate-3">
              <img 
                src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=1000" 
                alt="Clínica Moderna" 
                className="w-full h-full object-cover -rotate-3 scale-110"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-slate-50">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Heart, title: "Atendimento Humanizado", desc: "Médicos focados na sua história e necessidades individuais." },
              { icon: Shield, title: "Segurança Total", desc: "Protocolos rigorosos e tecnologia de última geração." },
              { icon: Clock, title: "Agilidade", desc: "Agendamento online e resultados rápidos para seus exames." }
            ].map((feature, i) => (
              <div key={i} className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100 hover:shadow-xl transition-all duration-500 group">
                <div className="bg-blue-50 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-colors">
                  <feature.icon className="h-8 w-8 text-blue-600 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default ClinicIndex;