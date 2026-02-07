import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Star, Quote } from "lucide-react";

interface Review {
  id: number;
  quote: string;
  author: string;
  rating: number;
  highlight: string;
}

const mockReviews: Review[] = [
  { id: 1, quote: "O hambúrguer gourmet é simplesmente divino! Ponto perfeito e ingredientes frescos. O ambiente é espetacular, me senti em um filme.", author: "Mariana S.", rating: 5, highlight: "Comida boa, ambiente bonito" },
  { id: 2, quote: "Comida boa, preço justo e atendimento que faz você se sentir em casa. A caipirinha de limão siciliano é imperdível!", author: "João P.", rating: 5, highlight: "Bom atendimento, preço justo" },
  { id: 3, quote: "Tivemos um pequeno atraso na entrega, mas a qualidade da costelinha compensou. O sabor é realmente de comida caseira. Comprometidos com a melhoria!", author: "Felipe A.", rating: 4, highlight: "Gostinho de comida caseira" },
  { id: 4, quote: "O melhor hambúrguer de São Paulo, sem dúvidas. A porção de batata frita trufada é viciante. Voltarei para experimentar a parmegiana.", author: "Carla M.", rating: 5, highlight: "Melhor hambúrguer" },
];

const TestimonialsCarousel = () => {
  return (
    <section id="reviews" className="py-16 md:py-24 bg-secondary/50">
      <div className="container">
        <h2 className="text-4xl font-bold text-center text-primary mb-4">O que dizem sobre o TremBão?</h2>
        <p className="text-center text-lg text-muted-foreground mb-12 max-w-2xl mx-auto">
          Nossa prioridade é a sua satisfação. Veja o feedback real dos nossos clientes.
        </p>

        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full max-w-5xl mx-auto"
        >
          <CarouselContent className="-ml-4">
            {mockReviews.map((review) => (
              <CarouselItem key={review.id} className="md:basis-1/2 lg:basis-1/3 pl-4">
                <div className="p-1 h-full">
                  <Card className="h-full bg-white shadow-xl border-accent/30 transition-transform duration-300 hover:scale-[1.02] rounded-xl">
                    <CardContent className="flex flex-col justify-between p-6 h-full">
                      <Quote className="h-8 w-8 text-accent mb-4" />
                      <p className="text-lg italic text-foreground mb-4 flex-grow">
                        "{review.quote}"
                      </p>
                      <div className="mt-4">
                        <div className="flex items-center mb-2">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-5 w-5 ${i < review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
                            />
                          ))}
                        </div>
                        <p className="font-semibold text-primary">{review.author}</p>
                        <span className="text-sm text-muted-foreground bg-secondary px-2 py-0.5 rounded-full mt-1 inline-block">
                          {review.highlight}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden md:flex" />
          <CarouselNext className="hidden md:flex" />
        </Carousel>
      </div>
    </section>
  );
};

export default TestimonialsCarousel;