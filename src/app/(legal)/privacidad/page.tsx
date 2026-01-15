import { LegalLayout } from '@/components/legal/legal-layout'
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Política de Privacidad | Joyas JP',
    description: 'Política de privacidad y protección de datos de Joyas JP.',
}

export default function PrivacyPage() {
    return (
        <LegalLayout
            title="Política de Privacidad"
            lastUpdated={new Date().toLocaleDateString('es-CL', { year: 'numeric', month: 'long', day: 'numeric' })}
        >
            <section>
                <h2>1. Información que Recopilamos</h2>
                <p>
                    En Joyas JP, respetamos su privacidad y estamos comprometidos a proteger los datos personales que comparte con nosotros.
                    Recopilamos información que usted nos proporciona directamente cuando realiza una compra, se registra en nuestro sitio,
                    se suscribe a nuestro boletín o se comunica con nuestro servicio de atención al cliente.
                </p>
                <p>
                    Esta información puede incluir su nombre, dirección de correo electrónico, dirección postal, número de teléfono y
                    detalles de pago. No almacenamos información sensible de tarjetas de crédito directamente en nuestros servidores.
                </p>
            </section>

            <section>
                <h2>2. Uso de la Información</h2>
                <p>
                    Utilizamos la información recopilada para los siguientes propósitos:
                </p>
                <ul>
                    <li>Procesar y completar sus pedidos y envíos.</li>
                    <li>Comunicarnos con usted sobre el estado de su pedido.</li>
                    <li>Enviar actualizaciones sobre nuevos productos u ofertas especiales (si ha optado por recibirlas).</li>
                    <li>Mejorar y optimizar la experiencia de compra en nuestro sitio web.</li>
                    <li>Detectar y prevenir fraudes o actividades no autorizadas.</li>
                </ul>
            </section>

            <section>
                <h2>3. Compartir Información</h2>
                <p>
                    No vendemos ni alquilamos su información personal a terceros. Solo compartimos su información con proveedores de
                    servicios de confianza que nos ayudan a operar nuestro negocio, como procesadores de pagos y empresas de logística,
                    siempre bajo estrictos acuerdos de confidencialidad.
                </p>
            </section>

            <section>
                <h2>4. Sus Derechos</h2>
                <p>
                    Usted tiene derecho a acceder, corregir o eliminar su información personal en cualquier momento. Si desea ejercer
                    estos derechos o tiene preguntas sobre nuestra política de privacidad, por favor contáctenos a través de nuestros
                    canales de atención al cliente.
                </p>
            </section>

            <section>
                <h2>5. Seguridad</h2>
                <p>
                    Implementamos medidas de seguridad técnicas y organizativas para proteger sus datos personales contra el acceso
                    no autorizado, la pérdida o la alteración. Utilizamos cifrado SSL para garantizar la seguridad de la transmisión
                    de datos en nuestro sitio.
                </p>
            </section>
        </LegalLayout>
    )
}
