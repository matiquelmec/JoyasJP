import Image from 'next/image';

const aboutPageContent = {
  title: "El Manifiesto Urbano",
  subtitle: "Capítulo I: El Estilo.",
  paragraphs: [
    "El flow no es exclusivo de los escenarios; está en la calle, en tu forma de caminar, en la confianza con la que te mueves. En JoyasJP, entendemos ese lenguaje a la perfección. No creamos las joyas, hacemos algo más difícil: las descubrimos. Somos curadores de estilo, obsesionados con encontrar las piezas que definen la estética urbana.",
    "Nuestra misión es sencilla: poner a tu alcance una colección que hable por ti. Cada pieza que seleccionamos ha sido elegida por su carácter, su peso y su capacidad de transformar un look en una declaración de principios.",
  ],
  closingStatement: "El respeto no se pide, se proyecta. Nosotros nos encargamos del brillo.",
};

export default function AboutPage() {
  return (
    <div className="bg-background text-foreground">
      <div className="relative h-[60vh] flex items-center justify-center text-center bg-black">
        <Image 
          src="/assets/nosotros.jpg" 
          alt="Equipo de JoyasJP" 
          fill={true}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover opacity-20"
          priority 
        />
        <div className="relative z-10 p-4">
          <h1 className="text-5xl md:text-7xl font-headline font-bold">{aboutPageContent.title}</h1>
          <p className="mt-4 text-xl text-muted-foreground">{aboutPageContent.subtitle}</p>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-24">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-4 text-lg text-foreground/90 leading-relaxed text-center">
            {aboutPageContent.paragraphs.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
          <p className="font-bold text-primary text-xl pt-12 text-center">
            {aboutPageContent.closingStatement}
          </p>
        </div>
      </div>
    </div>
  );
}
