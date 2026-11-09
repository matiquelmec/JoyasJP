import { LegalLayout } from '@/components/legal/legal-layout'
import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
    title: 'Términos y Condiciones de Compra | Joyas JP',
    description: 'Términos y condiciones de uso y compra en Joyas JP conforme a la Ley N° 19.496 y el Decreto N° 14 de Comercio Electrónico en Chile.',
}

export default function TermsPage() {
    return (
        <LegalLayout
            title="Términos y Condiciones de Uso y Compra"
            lastUpdated="8 de noviembre de 2026 (Versión 2026.1)"
        >
            <section>
                <h2>1. Identificación del Proveedor (Art. 4 Decreto N° 14 / Ley 19.496)</h2>
                <p>
                    El presente sitio web de comercio electrónico es operado por <strong>JOYAS JP SPA</strong>, RUT <strong>78.489.968-3</strong>, 
                    con domicilio legal en <strong>Los Plátanos 3858 DP 1106, Comuna de Macul, Santiago, Chile</strong>.
                </p>
                <p>
                    Canales de atención al cliente y soporte posventa:
                </p>
                <ul>
                    <li><strong>Correo electrónico:</strong> empresa.joyasjp.cl@gmail.com</li>
                    <li><strong>Teléfono / WhatsApp oficial:</strong> +56 9 8299 0513</li>
                    <li><strong>Horario de atención:</strong> Lunes a viernes de 09:00 a 18:00 hrs. y sábados de 10:00 a 16:00 hrs.</li>
                </ul>
            </section>

            <section>
                <h2>2. Proceso de Compra, Precios y Formación del Consentimiento</h2>
                <p>
                    Todos los precios publicados en el catálogo están expresados en Pesos Chilenos (CLP) e incluyen el Impuesto al Valor Agregado (IVA - 19%).
                </p>
                <p>
                    Antes de confirmar la compra y redirigir a la pasarela de pagos, el consumidor cuenta con un resumen transparente y desglosado 
                    del valor de los productos, descuentos aplicados y opciones de envío. La confirmación de la orden genera el envío automático 
                    de un comprobante electrónico y detalle de la compra al correo proporcionado.
                </p>
            </section>

            <section>
                <h2>3. Disponibilidad y Control Previo de Stock</h2>
                <p>
                    En estricto cumplimiento del Reglamento de Comercio Electrónico, Joyas JP realiza una validación técnica y en tiempo real del 
                    inventario disponible antes de autorizar el cobro, garantizando que todo producto adquirido cuenta con stock verificado para su despacho.
                </p>
            </section>

            <section>
                <h2>4. Medios de Pago</h2>
                <p>
                    Las transacciones se procesan de forma segura a través de la pasarela <strong>Flow.cl</strong>, admitiendo tarjetas de débito, 
                    crédito (Webpay Plus), transferencias y otros medios habilitados. Joyas JP no almacena ni tiene acceso a los datos bancarios 
                    o de tarjetas de los usuarios.
                </p>
            </section>

            <section>
                <h2>5. Envíos, Despachos y Costos</h2>
                <p>
                    Realizamos despachos a todo Chile a través de empresas de transporte certificadas (como Starken) y entregas presenciales 
                    coordinadas en puntos autorizados de Santiago. Los plazos y tarifas de envío se informan de manera clara y previa al pago. 
                    El número de seguimiento de la orden es remitido al cliente tan pronto el paquete es admitido por el operador logístico.
                </p>
            </section>

            <section>
                <h2>6. Garantía Legal de 6 Meses (Art. 20 y 21 Ley N° 19.496)</h2>
                <p>
                    Todas nuestras piezas de joyería cuentan con la <strong>Garantía Legal irrenunciable de 6 meses</strong> contados desde la recepción del producto. 
                    Si la joya presenta defectos de fabricación, fallas en los materiales (ej. vicios de calidad en Plata Ley 925 u Oro) o no cumple con las especificaciones publicitadas, el consumidor tiene el derecho de optar libremente entre:
                </p>
                <ul>
                    <li><strong>1. Reparación gratuita</strong> del producto; o</li>
                    <li><strong>2. Cambio o reposición</strong> por una nueva pieza de similares características; o</li>
                    <li><strong>3. Devolución íntegra del dinero pagado</strong>.</li>
                </ul>
                <p>
                    Para hacer efectiva la garantía legal, solo debe presentar su boleta o comprobante de compra y contactarnos por nuestros canales de soporte.
                </p>
            </section>

            <section>
                <h2>7. Derecho a Retracto de 10 Días (Art. 3 bis Ley N° 19.496) y Excepción Sanitaria Informada</h2>
                <p>
                    El consumidor tiene derecho a retractarse de la compra celebrada por vía electrónica dentro del plazo de <strong>10 días corridos</strong> contados desde la recepción del producto, sin expresión de causa. Para ejercerlo, la pieza debe restituirse sin uso, con sus etiquetas, accesorios y embalajes originales en perfecto estado.
                </p>
                <p className="p-4 rounded-lg bg-zinc-900 border border-amber-500/30 text-amber-200">
                    <strong>⚠️ Advertencia Sanitaria Previa:</strong> Por estrictas razones de salud pública, higiene y protección de los consumidores, 
                    los <strong>aros, pendientes o piezas corporales perforantes</strong> cuyo sello o empaque protector de seguridad haya sido abierto 
                    o manipulado <strong>no admiten derecho a retracto voluntario</strong>. Lo anterior no afecta de ninguna manera el derecho irrenunciable 
                    a la Garantía Legal de 6 meses en caso de fallas o defectos de calidad del producto.
                </p>
            </section>

            <section>
                <h2>8. Tratamiento de Datos Personales</h2>
                <p>
                    El tratamiento de datos derivado del uso de la tienda se rige por nuestra{' '}
                    <Link href="/privacidad" className="text-primary hover:underline font-semibold">
                        Política de Privacidad
                    </Link>{' '}
                    y la Ley N° 21.719.
                </p>
            </section>

            <section>
                <h2>9. Legislación Aplicable y Jurisdicción</h2>
                <p>
                    Los presentes términos se rigen por las leyes de la República de Chile. Cualquier controversia será sometida al conocimiento 
                    de los tribunales ordinarios de justicia o a los juzgados de policía local competentes en conformidad con la Ley N° 19.496.
                </p>
            </section>
        </LegalLayout>
    )
}
