import { LegalLayout } from '@/components/legal/legal-layout'
import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
    title: 'Política de Privacidad y Protección de Datos | Joyas JP',
    description: 'Política de Privacidad conforme a la Ley N° 21.719 de Protección de Datos Personales en Chile.',
}

export default function PrivacyPage() {
    return (
        <LegalLayout
            title="Política de Privacidad y Protección de Datos Personales"
            lastUpdated="8 de noviembre de 2026 (Versión 2026.1)"
        >
            <section>
                <h2>1. Identificación del Responsable del Tratamiento y Contacto DPO</h2>
                <p>
                    El responsable del tratamiento de sus datos personales es <strong>JOYAS JP SPA</strong> (en adelante, &quot;Joyas JP&quot;), 
                    RUT <strong>78.489.968-3</strong>, con domicilio legal en <strong>Los Plátanos 3858 DP 1106, Comuna de Macul, Santiago, Chile</strong>.
                </p>
                <p>
                    Para cualquier consulta, solicitud o ejercicio de derechos relacionados con sus datos personales, puede contactar a nuestro 
                    Encargado de Privacidad / Delegado de Protección de Datos (DPO) mediante el correo electrónico:{' '}
                    <a href="mailto:empresa.joyasjp.cl@gmail.com" className="text-primary hover:underline">
                        empresa.joyasjp.cl@gmail.com
                    </a>{' '}
                    o a través de nuestro teléfono de contacto <strong>+56 9 8299 0513</strong>.
                </p>
            </section>

            <section>
                <h2>2. Marco Regulatorio y Principios Aplicables</h2>
                <p>
                    Esta política se rige estrictamente por la legislación chilena vigente, en particular la <strong>Ley N° 21.719 de Protección y Tratamiento de los Datos Personales</strong>, 
                    la Ley N° 19.496 sobre Protección de los Derechos de los Consumidores y la Ley N° 21.663 Marco de Ciberseguridad. 
                    Joyas JP aplica de forma irrestricta los principios de licitud, lealtad, transparencia, finalidad, proporcionalidad, 
                    minimización de datos, exactitud, seguridad y responsabilidad demostrada (accountability).
                </p>
            </section>

            <section>
                <h2>3. Finalidades del Tratamiento y Bases de Licitud (Art. 12 y 13 Ley 21.719)</h2>
                <p>
                    Tratamos sus datos únicamente con propósitos específicos, explícitos y legítimos:
                </p>
                <ul>
                    <li>
                        <strong>Gestión y Ejecución de la Compraventa (Base: Ejecución Contractual):</strong> Tratamos su nombre completo, RUT, dirección de despacho, 
                        correo electrónico y teléfono para validar stock, procesar pagos, gestionar el despacho físico de joyas y atender requerimientos postventa.
                    </li>
                    <li>
                        <strong>Emisión de Documentos Tributarios (Base: Cumplimiento de Obligación Legal):</strong> Emisión de boletas y facturas electrónicas 
                        conforme a la normativa del Servicio de Impuestos Internos (SII).
                    </li>
                    <li>
                        <strong>Prevención de Fraudes y Ciberseguridad (Base: Interés Legítimo y Obligación Legal):</strong> Control de integridad de transacciones, 
                        detección de anomalías en el pago y resguardo de la infraestructura digital.
                    </li>
                    <li>
                        <strong>Comunicaciones Comerciales y Marketing (Base: Consentimiento Expreso Opt-In):</strong> Envío de novedades, promociones y lanzamientos 
                        únicamente si usted ha otorgado su consentimiento voluntario e informado. Este consentimiento puede ser revocado en cualquier momento.
                    </li>
                </ul>
            </section>

            <section>
                <h2>4. Minimización y Datos de Menores de Edad</h2>
                <p>
                    Solo solicitamos los datos estrictamente necesarios para concretar la venta y despacho de nuestros productos. 
                    Nuestra tienda y servicios están dirigidos exclusivamente a mayores de 18 años. No recopilamos deliberadamente 
                    datos de niños o adolescentes menores de 14 años sin autorización expresa de sus padres o representantes legales.
                </p>
            </section>

            <section>
                <h2>5. Destinatarios, Encargados y Transferencias Internacionales</h2>
                <p>
                    No comercializamos ni cedemos sus datos a terceros. Para la correcta prestación de nuestros servicios, compartimos información exclusivamente con encargados del tratamiento bajo contratos de confidencialidad y estándares de seguridad:
                </p>
                <ul>
                    <li><strong>Pasarela de Pago:</strong> Flow S.A. (Flow.cl), regulada en Chile, para el procesamiento cifrado de transacciones bancarias y tarjetas.</li>
                    <li><strong>Operadores Logísticos:</strong> Empresas de transporte (como Starken o entrega coordinada) para la entrega física de sus pedidos.</li>
                    <li><strong>Infraestructura Cloud:</strong> Proveedores tecnológicos de servidores seguros (Turso Database y Netlify) que operan con cifrado de datos en reposo y en tránsito bajo Cláusulas Contractuales Modelo.</li>
                </ul>
            </section>

            <section>
                <h2>6. Plazos de Conservación</h2>
                <p>
                    Sus datos personales se conservan durante el tiempo estrictamente necesario para cumplir las finalidades descritas:
                </p>
                <ul>
                    <li>Datos tributarios y de facturación: Se conservan durante los plazos legales establecidos por el Código Tributario chileno (6 años).</li>
                    <li>Datos de contacto y navegación: Hasta que usted solicite su supresión o revoque el consentimiento otorgado.</li>
                </ul>
            </section>

            <section>
                <h2>7. Derechos ARCOP y Procedimiento para su Ejercicio (Art. 4 al 11 Ley 21.719)</h2>
                <p>
                    Usted goza de los siguientes derechos en relación con sus datos personales:
                </p>
                <ul>
                    <li><strong>Acceso:</strong> Conocer si sus datos están siendo tratados y acceder a ellos.</li>
                    <li><strong>Rectificación:</strong> Corregir información inexacta, desactualizada o incompleta.</li>
                    <li><strong>Cancelación / Supresión:</strong> Solicitar la eliminación de sus datos cuando no exista fundamento legal para su conservación.</li>
                    <li><strong>Oposición:</strong> Oponerse a tratamientos basados en interés legítimo o mercadotecnia.</li>
                    <li><strong>Bloqueo Temporal:</strong> Solicitar la suspensión inmediata del uso de sus datos ante inexactitud o controversia (plazo legal de atención: <strong>2 días hábiles</strong>).</li>
                    <li><strong>Portabilidad:</strong> Obtener una copia de sus datos en formato estructurado e interoperable.</li>
                </ul>
                <p>
                    Puede ejercer cualquiera de estos derechos sin costo alguno a través de nuestro{' '}
                    <Link href="/derechos-arcop" className="text-primary hover:underline font-semibold">
                        Formulario de Derechos ARCOP
                    </Link>{' '}
                    o remitiendo un correo a <strong>empresa.joyasjp.cl@gmail.com</strong>. El plazo máximo de respuesta formal es de <strong>30 días corridos</strong> (salvo el bloqueo temporal que opera en 2 días hábiles).
                </p>
            </section>

            <section>
                <h2>8. Seguridad de la Información (Ley N° 21.663)</h2>
                <p>
                    Implementamos rigurosas medidas técnicas y organizativas para salvaguardar sus datos: conexiones cifradas mediante HTTPS/TLS 1.3, autenticación robusta, sesiones seguras en cookies HttpOnly y monitoreo activo de integridad de sistemas. En caso de incidentes de seguridad que afecten sus derechos, se activarán los protocolos de notificación legal correspondientes ante la autoridad competente y los titulares afectados.
                </p>
            </section>
        </LegalLayout>
    )
}
