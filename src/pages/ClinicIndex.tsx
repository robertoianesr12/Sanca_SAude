import React from "react";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import { Heart, Shield, Clock, Activity } from "lucide-react";

const ClinicIndex = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <HeroSection />

      {/* Features Section */}
      <section className="py-32 bg-slate-50">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { icon: Heart, title: "Cuidado Humanizado", desc: "Nossa equipe é treinada para oferecer acolhimento e empatia em cada consulta." },
              { icon: Shield, title: "Segurança de Dados", desc: "Seus registros médicos são protegidos com criptografia de nível bancário." },
              { icon: Clock, title: "Sem Filas", desc: "Sistema de agendamento inteligente que respeita rigorosamente seu horário." }
            ].map((feature, i) => (
              <div key={i} className="glass-card p-12 rounded-[3rem] hover:scale-105 transition-all duration-500 group">
                <div className="bg-primary/10 w-20 h-20 rounded-3xl flex items-center justify-center mb-8 group-hover:bg-primary transition-colors">
                  <feature.icon className="h-10 w-10 text-primary group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tighter">{feature.title}</h3>
                <p className="text-slate-500 leading-relaxed text-lg">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 bg-primary">
        <div className="container grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
          {[
            { label: "Pacientes", val: "15k+" },
            { label: "Especialistas", val: "45" },
            { label: "Anos de Exp", val: "12" },
            { label: "Satisfação", val: "99%" }
          ].map((stat, i) => (
            <div key={i} className="space-y-2">
              <div className="text-5xl font-black text-white tracking-tighter">{stat.val}</div>
              <div className="text-blue-100 font-bold uppercase tracking-widest text-xs">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default ClinicIndex;