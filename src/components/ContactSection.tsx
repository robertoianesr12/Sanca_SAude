import React from "react";
import ContactForm from "./ContactForm";
import FAQSection from "./FAQSection";
import { MessageCircle, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

const ContactSection = () => {
  return (
    <section className="container py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        
        {/* Contact Form (2/3 width on large screens) */}
        <div className="lg:col-span-2">
          <ContactForm />
        </div>

        {/* Sidebar/Info (1/3 width on large screens) */}
        <div className="space-y-8">
          
          {/* Live Chat Placeholder */}
          <div className="p-6 bg-secondary rounded-xl shadow-lg border border-accent/30 text-center">
            <MessageCircle className="h-8 w-8 mx-auto text-accent mb-3" />
            <h4 className="text-xl font-bold text-foreground mb-2">Chat ao Vivo</h4>
            <p className="text-muted-foreground mb-4 text-sm">
              Precisa de ajuda imediata? Clique abaixo para falar com um de nossos atendentes.
            </p>
            <Button className="w-full bg-accent hover:bg-accent/90 text-primary font-semibold rounded-lg">
              Iniciar Chat
            </Button>
          </div>

          {/* Quick Info */}
          <div className="p-6 bg-card rounded-xl shadow-lg border border-border">
            <h4 className="text-xl font-bold text-primary mb-4">Informações Rápidas</h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-center text-muted-foreground">
                <Phone className="h-4 w-4 mr-3 text-accent" />
                <span>Telefone: (11) 98765-4321</span>
              </div>
              <div className="flex items-center text-muted-foreground">
                <MapPin className="h-4 w-4 mr-3 text-accent" />
                <span>Endereço: Rua Gourmet, 123, SP</span>
              </div>
              <p className="mt-4 text-xs text-muted-foreground">
                Horário de atendimento telefônico: 17:00h às 23:00h.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* FAQ Section below forms */}
      <div className="mt-16 max-w-4xl mx-auto">
        <FAQSection />
      </div>
    </section>
  );
};

export default ContactSection;