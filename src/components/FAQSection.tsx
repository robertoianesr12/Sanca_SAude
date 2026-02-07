import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";

const faqs = [
  {
    question: "Qual o horário de funcionamento do TremBão?",
    answer: "Estamos abertos de Segunda a Quinta das 18:00h às 23:00h, e de Sexta a Sábado das 18:00h à 01:00h. Fechamos aos Domingos.",
  },
  {
    question: "Quais são as formas de pagamento aceitas?",
    answer: "Aceitamos PIX, cartões de crédito e débito (Visa, Mastercard, Elo) e dinheiro. Para pedidos online, aceitamos PIX e cartão.",
  },
  {
    question: "Vocês têm opções veganas ou vegetarianas?",
    answer: "Sim! Temos o nosso delicioso Veggie Burger e diversas opções de porções e saladas que podem ser adaptadas para dietas vegetarianas e veganas.",
  },
  {
    question: "Como faço para reservar uma mesa para um grupo grande?",
    answer: "Reservas online são limitadas a 10 pessoas. Para grupos maiores, por favor, entre em contato diretamente pelo telefone (11) 98765-4321 ou utilize o formulário de contato.",
  },
];

const FAQSection = () => {
  return (
    <div className="w-full">
      <h3 className="text-3xl font-bold text-primary mb-6 flex items-center">
        <HelpCircle className="h-6 w-6 mr-2 text-accent" /> Perguntas Frequentes
      </h3>
      <Accordion type="single" collapsible className="w-full space-y-2">
        {faqs.map((faq, index) => (
          <AccordionItem 
            key={index} 
            value={`item-${index}`} 
            className="border-b border-primary/20 bg-card p-4 rounded-xl shadow-md"
          >
            <AccordionTrigger className="text-left font-semibold text-lg hover:no-underline text-foreground hover:text-primary transition-colors">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent className="pt-2 text-muted-foreground">
              {faq.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

export default FAQSection;