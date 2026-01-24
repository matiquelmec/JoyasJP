import Image from 'next/image'
import { getImageUrl } from '@/lib/asset-version'

const aboutPageContent = {
  title: 'El Manifiesto Urbano',
  subtitle: 'Capítulo I: El Estilo.',
  paragraphs: [
    'El flow no es exclusivo de los escenarios; está en la calle, en tu forma de caminar, en la confianza con la que te mueves. En JoyasJP, entendemos ese lenguaje a la perfección. No creamos las joyas, hacemos algo más difícil: las descubrimos. Somos curadores de estilo, obsesionados con encontrar las piezas que definen la estética urbana.',
    'Nuestra misión es sencilla: poner a tu alcance una colección que hable por ti. Cada pieza que seleccionamos ha sido elegida por su carácter, su peso y su capacidad de transformar un look en una obra de arte.',
  ],
  closingStatement:
    'Cada pieza cuenta una historia. La tuya está esperando.',
}

export default function AboutPage() {
  return (
    <div className="relative min-h-[130vh] bg-black text-white flex items-center justify-center overflow-hidden -mt-36 sm:-mt-44 md:-mt-48 lg:-mt-56">
      {/* Background Image - The Chain */}
      <div className="absolute inset-0 z-0 flex items-center justify-center">
        <Image
          src={getImageUrl('nosotros.webp')}
          alt="Equipo de JoyasJP"
          fill={true}
          sizes="100vw"
          className="object-cover opacity-80"
          priority
          fetchPriority="high"
        />
        {/* Vignette effect to focus focus center */}
        <div className="absolute inset-0 bg-radial-gradient from-transparent via-black/20 to-black/80" />
        {/* Bottom Fade for Footer transition */}
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black to-transparent" />
      </div>

      <div className="container relative z-10 px-4 py-12 md:py-20">
        {/* Glassmorphism Container */}
        <div className="max-w-4xl mx-auto p-8 md:p-12 rounded-3xl bg-black/30 backdrop-blur-md border border-white/10 shadow-2xl animate-fadeInUp">

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

            <p className="pt-6 text-lg md:text-xl font-bold text-amber-200/90 tracking-[0.2em] uppercase drop-shadow-md border-t border-white/5 mt-8">
              {aboutPageContent.closingStatement}
            </p>

          </div>
        </div>
      </div>
    </div>
  )
}
