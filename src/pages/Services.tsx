import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, DollarSign, ArrowRight, Sparkles } from "lucide-react";
import BookingModal from "@/components/BookingModal";
import { Link } from "react-router-dom";

const Services = () => {
  const [services, setServices] = useState<any[]>([]);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchServices = async () => {
      const { data } = await supabase.from('services').select('*');
      setServices(data || []);
    };
    fetchServices();
  }, []);

  const handleOpenBooking = (service: any) => {
    setSelectedService(service);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-20">
      <div className="container">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 px-4 py-1 rounded-full">
            <Sparkles className="h-3 w-3 mr-2" /> Especialidades
          </Badge>
          <h1 className="text-5xl font-extrabold text-slate-900 tracking-tight">
            Nossos <span className="text-blue-600">Serviços</span>
          </h1>
          <p className="text-xl text-slate-600">
            Oferecemos o que há de mais moderno em medicina diagnóstica e tratamentos especializados.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service) => (
            <Card key={service.id} className="group border-none shadow-lg hover:shadow-2xl transition-all duration-500 rounded-[2.5rem] overflow-hidden bg-white">
              <div className="h-48 bg-blue-600 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <div className="absolute bottom-6 left-8">
                  <Badge className="bg-white/20 backdrop-blur-md text-white border-none">
                    {service.duration} min
                  </Badge>
                </div>
              </div>
              <CardHeader className="p-8">
                <CardTitle className="text-2xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                  {service.name}
                </CardTitle>
                <CardDescription className="text-slate-600 leading-relaxed mt-2">
                  {service.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="px-8 pb-4">
                <div className="flex items-center justify-between text-slate-900 font-bold text-xl">
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-5 w-5 text-blue-600" />
                    {service.price?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                    <Clock className="h-4 w-4" />
                    Duração média
                  </div>
                </div>
              </CardContent>
              <CardFooter className="p-8 pt-4">
                <Button 
                  onClick={() => handleOpenBooking(service)}
                  className="w-full bg-slate-900 hover:bg-blue-600 text-white rounded-2xl py-6 text-lg font-bold transition-all group-hover:scale-[1.02]"
                >
                  Agendar Agora <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="mt-20 text-center">
          <p className="text-slate-500 mb-6">Não encontrou o que procurava?</p>
          <Button asChild variant="link" className="text-blue-600 font-bold text-lg">
            <Link to="/contato">Fale com nossa equipe de suporte</Link>
          </Button>
        </div>
      </div>

      <BookingModal 
        service={selectedService} 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
};

export default Services;