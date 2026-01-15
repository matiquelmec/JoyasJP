import { LegalLayout } from '@/components/legal/legal-layout'
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Términos y Condiciones | Joyas JP',
    description: 'Términos y condiciones de uso y compra en Joyas JP.',
}

export default function TermsPage() {
    return (
        <LegalLayout
            title="Términos y Condiciones"
            lastUpdated={new Date().toLocaleDateString('es-CL', { year: 'numeric', month: 'long', day: 'numeric' })}
        >
            <section>
                <h2>1. Aceptación de los Términos</h2>
                <p>
                    Bienvenido a Joyas JP. Al acceder y utilizar nuestro sitio web, usted acepta cumplir y estar sujeto a los siguientes
                    términos y condiciones. Si no está de acuerdo con alguna parte de estos términos, le recomendamos que no utilice
                    nuestros servicios.
                </p>
            </section>

            <section>
                <h2>2. Productos y Disponibilidad</h2>
                <p>
                    Nos esforzamos por mostrar con la mayor precisión posible los colores, características y especificaciones de nuestros
                    productos. Sin embargo, no garantizamos que la visualización en su pantalla sea exacta. Todos los productos están
                    sujetos a disponibilidad y podemos limitar las cantidades de cualquier producto que ofrecemos.
                </p>
            </section>

            <section>
                <h2>3. Precios y Pagos</h2>
                <p>
                    Todos los precios mostrados en el sitio están en Pesos Chilenos (CLP) e incluyen los impuestos aplicables, a menos
                    que se indique lo contrario. Nos reservamos el derecho de modificar los precios en cualquier momento sin previo aviso.
                </p>
                <p>
                    Aceptamos los métodos de pago indicados en el proceso de compra. El pago debe completarse en su totalidad antes del envío.
                </p>
            </section>

            <section>
                <h2>4. Envíos y Entregas</h2>
                <p>
                    Realizamos envíos a todo Chile. Los tiempos de entrega son estimados y pueden variar según la ubicación y factores
                    externos. Joyas JP no se hace responsable por retrasos causados por las empresas de transporte, aunque haremos
                    todo lo posible para asistirle en el seguimiento de su pedido.
                </p>
            </section>

            <section>
                <h2>5. Cambios y Devoluciones</h2>
                <p>
                    Aceptamos cambios y devoluciones dentro de los 10 días posteriores a la recepción del producto, siempre que el
                    artículo esté sin uso, en su embalaje original y con todas las etiquetas intactas. Por razones de higiene, ciertos
                    productos como aros pueden tener restricciones especiales de devolución.
                </p>
            </section>

            <section>
                <h2>6. Propiedad Intelectual</h2>
                <p>
                    Todo el contenido de este sitio, incluyendo textos, gráficos, logotipos, imágenes y software, es propiedad de
                    Joyas JP y está protegido por las leyes de propiedad intelectual chilenas e internacionales.
                </p>
            </section>

            <section>
                <h2>7. Contacto</h2>
                <p>
                    Para cualquier consulta relacionada con estos términos, por favor contáctenos a través de nuestro formulario de
                    contacto o escribiéndonos directamente a nuestro correo electrónico de atención al cliente.
                </p>
            </section>
        </LegalLayout>
    )
}
