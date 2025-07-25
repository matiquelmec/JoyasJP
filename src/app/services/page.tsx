import { Button } from '@/components/ui/button';
import Link from 'next/link';

const servicesPageContent = {
  title: {
    line1: "Servicios Exclusivos",
    line2: "para Artistas"
  },
  paragraphs: [
    "Tu música y tu imagen merecen brillar con la misma intensidad. En Joyas JP, entendemos que el estilo es una parte fundamental de tu identidad artística. Por eso, ofrecemos un servicio de venta, préstamo y alquiler de nuestras piezas más icónicas para tus videoclips, sesiones de fotos y eventos.",
    "Accede a nuestra colección completa y elige las joyas que definan tu flow y eleven tu producción al siguiente nivel. Contáctanos por WhatsApp o Instagram para contarnos sobre tu proyecto y te prepararemos una propuesta a medida."
  ]
};

export default function ServicesPage() {
  return (
    <div className="bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-28 md:py-36">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-headline font-bold">
            {servicesPageContent.title.line1}
            <br />
            <span className="text-primary">{servicesPageContent.title.line2}</span>
          </h1>
          {servicesPageContent.paragraphs.map((paragraph, index) => (
            <p key={index} className="mt-6 text-lg text-muted-foreground leading-relaxed">
              {paragraph}
            </p>
          ))}
          <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link href="https://wa.me/56982990513" target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="font-bold text-lg px-8 py-6 bg-primary text-primary-foreground hover:bg-primary/90 transition-transform duration-300 hover:scale-105 w-64">
                Contactar por WhatsApp
              </Button>
            </Link>
            <Link href="https://instagram.com/joyasjp" target="_blank" rel="noopener noreferrer">
              <Button size="lg" variant="outline" className="font-bold text-lg px-8 py-6 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-transform duration-300 hover:scale-105 w-64">
                Enviar DM a Instagram
              </Button>
            </Link>
          </div>
          <div className="mt-12 relative w-full aspect-video rounded-lg overflow-hidden shadow-2xl shadow-primary/10 bg-black">
            <video
              src="/assets/mi-video2.mp4"
              autoPlay
              loop
              muted
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
