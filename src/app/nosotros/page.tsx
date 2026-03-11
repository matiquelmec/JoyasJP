import Image from 'next/image'
import { getSafeUrl } from '@/lib/safe-asset'

const aboutPageContent = {
  title: 'El Manifiesto Urbano',
  subtitle: 'Capítulo I: El Estilo.',
  paragraphs: [
    'El flow no es exclusivo de los escenarios; está en la calle, en tu forma de caminar, en la confianza con la que te mueves. En JoyasJP, entendemos ese lenguaje a la perfección. No creamos las joyas, hacemos algo más difícil: las descubrimos. Somos curadores de estilo, obsesionados con encontrar las piezas que definen la estética urbana.',
    'Nuestra misión es sencilla: poner a tu alcance una colección que hable por ti. Cada pieza que seleccionamos ha sido elegida por su carácter, su peso y su capacidad de transformar un look en una obra de arte.',
  ],
  closingStatement: 'Cada joya cuenta una historia. La tuya está esperando.',
}

export default function AboutPage() {
  return (
    // main tiene pt-0 (isHeroPage=true) → este div empieza en y=0, detrás del header
    <div className="relative min-h-screen bg-black text-white overflow-hidden">

      {/* Imagen: absolute inset-0 de este div → cubre desde y=0, detrás del header transparente */}
      <Image
        src={getSafeUrl('nosotros.webp')}
        alt="Equipo de JoyasJP"
        fill
        sizes="100vw"
        className="object-cover opacity-80"
        priority
        quality={90}
      />
      {/* Vignette */}
      <div className="absolute inset-0 bg-radial-gradient from-transparent via-black/20 to-black/80" />
      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black to-transparent" />

      {/* Contenido: mt-36/mt-40 en móvil empuja el card DEBAJO del header */}
      <div className="relative z-10 container px-4 py-8 mt-36 sm:mt-40 md:mt-0 md:min-h-screen md:flex md:items-center md:justify-center">
        <div className="max-w-4xl mx-auto p-8 md:p-12 rounded-3xl bg-black/30 backdrop-blur-md border border-white/10 shadow-2xl animate-fadeInUp" style={{ willChange: 'filter, transform' }}>
          <div className="max-w-3xl mx-auto text-center space-y-8">

            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl font-headline font-bold tracking-tight text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
                {aboutPageContent.title}
              </h1>
              <p className="text-xl md:text-2xl text-white/90 font-light tracking-wide drop-shadow-md">
                {aboutPageContent.subtitle}
              </p>
            </div>

            <div className="h-px w-32 mx-auto bg-gradient-to-r from-transparent via-amber-200/50 to-transparent" />

            <div className="space-y-6 text-lg md:text-xl text-zinc-100 leading-relaxed font-body">
              {aboutPageContent.paragraphs.map((paragraph, index) => (
                <p key={index} className="drop-shadow-sm">
                  {paragraph}
                </p>
              ))}
            </div>

            <p className="pt-6 text-lg md:text-xl font-bold text-primary tracking-[0.2em] uppercase drop-shadow-md border-t border-white/5 mt-8">
              {aboutPageContent.closingStatement}
            </p>

          </div>
        </div>
      </div>
    </div>
  )
}
