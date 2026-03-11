import Image from 'next/image'
import { getSafeUrl } from '@/lib/safe-asset'


const aboutPageContent = {
  title: 'El Manifiesto Urbano',
  subtitle: 'Capítulo I: El Estilo.',
  paragraphs: [
    'El flow no es exclusivo de los escenarios; está en la calle, en tu forma de caminar, en la confianza con la que te mueves. En JoyasJP, entendemos ese lenguaje a la perfección. No creamos las joyas, hacemos algo más difícil: las descubrimos. Somos curadores de estilo, obsesionados con encontrar las piezas que definen la estética urbana.',
    'Nuestra misión es sencilla: poner a tu alcance una colección que hable por ti. Cada pieza que seleccionamos ha sido elegida por su carácter, su peso y su capacidad de transformar un look en una obra de arte.',
  ],
  closingStatement:
    'Cada joya cuenta una historia. La tuya está esperando.',
}

export default function AboutPage() {
  return (
    // Wrapper principal: la imagen de fondo (absolute) pertenece a ESTE elemento → cubre todo incluyendo la zona del header
    <div className="relative min-h-screen bg-black text-white overflow-hidden">

      {/* Imagen de fondo directamente hija del wrapper → inset-0 cubre desde y=0 real, detrás del header */}
      <Image
        src={getSafeUrl('nosotros.webp')}
        alt="Equipo de JoyasJP"
        fill={true}
        sizes="100vw"
        className="object-cover opacity-80"
        style={{ zIndex: 0 }}
        priority
        quality={90}
      />
      {/* Vignette overlay */}
      <div className="absolute inset-0 bg-radial-gradient from-transparent via-black/20 to-black/80" style={{ zIndex: 1 }} />
      {/* Bottom fade para Footer */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black to-transparent" style={{ zIndex: 1 }} />

      {/* Contenido en flujo normal sobre la imagen */}
      <div className="relative flex flex-col min-h-screen" style={{ zIndex: 2 }}>

        {/* Spacer con la altura exacta del header fijo en cada breakpoint */}
        <div className="h-36 sm:h-40 md:h-44 lg:h-48 shrink-0" aria-hidden="true" />

        {/* Contenido centrado en el espacio disponible */}
        <div className="flex-1 flex items-center justify-center py-8">
          <div className="container px-4">
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

        <div className="h-12 shrink-0" aria-hidden="true" />
      </div>
    </div>
  )
}
