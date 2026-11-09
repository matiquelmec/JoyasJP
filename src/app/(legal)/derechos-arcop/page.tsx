'use client'

import { useState } from 'react'
import { LegalLayout } from '@/components/legal/legal-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2, Loader2, ShieldCheck, Clock } from 'lucide-react'
import { toast } from 'sonner'

export default function ArcopPage() {
    const [submitting, setSubmitting] = useState(false)
    const [submittedFolio, setSubmittedFolio] = useState<string | null>(null)
    const [formData, setFormData] = useState({
        fullName: '',
        rut: '',
        email: '',
        phone: '',
        rightType: 'acceso',
        details: '',
        termsAccepted: false,
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.fullName || !formData.rut || !formData.email || !formData.details) {
            toast.error('Campos incompletos', { description: 'Por favor complete todos los datos requeridos.' })
            return
        }

        if (!formData.termsAccepted) {
            toast.error('Consentimiento requerido', { description: 'Debe confirmar que es el titular de los datos o su representante.' })
            return
        }

        setSubmitting(true)

        try {
            const res = await fetch('/api/compliance/arcop', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || 'Error al enviar solicitud')
            }

            setSubmittedFolio(data.folio)
            toast.success('Solicitud ingresada exitosamente', {
                description: `Su folio es ${data.folio}. Revisaremos su solicitud en los plazos legales.`,
            })
        } catch (err: any) {
            toast.error('Error al registrar', {
                description: err.message || 'No se pudo procesar la solicitud. Intente nuevamente o escriba a empresa.joyasjp.cl@gmail.com.',
            })
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <LegalLayout
            title="Canal de Ejercicio de Derechos ARCOP"
            lastUpdated="8 de noviembre de 2026 (Ley N° 21.719)"
        >
            <div className="space-y-8">
                <section>
                    <p>
                        En cumplimiento de los artículos 4° al 11° de la <strong>Ley N° 21.719 sobre Protección y Tratamiento de Datos Personales</strong>, 
                        los titulares de datos pueden solicitar en cualquier momento y de forma gratuita el ejercicio de sus derechos ante <strong>JOYAS JP SPA</strong>.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                        <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950/60">
                            <div className="flex items-center gap-2 text-primary font-bold mb-1 text-sm">
                                <Clock className="w-4 h-4" />
                                <span>Bloqueo Temporal (Urgente)</span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Plazo legal máximo de atención y ejecución: <strong>2 días hábiles</strong>.
                            </p>
                        </div>
                        <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950/60">
                            <div className="flex items-center gap-2 text-primary font-bold mb-1 text-sm">
                                <ShieldCheck className="w-4 h-4" />
                                <span>Acceso, Rectificación, Supresión, Oposición y Portabilidad</span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Plazo legal máximo de respuesta fundada: <strong>30 días corridos</strong>.
                            </p>
                        </div>
                    </div>
                </section>

                {submittedFolio ? (
                    <Card className="border-emerald-500/30 bg-emerald-500/5">
                        <CardHeader className="text-center">
                            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
                            <CardTitle className="text-xl text-emerald-400">Solicitud Registrada con Éxito</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-center">
                            <p className="text-sm text-zinc-300">
                                Hemos recibido su solicitud bajo el siguiente folio de trazabilidad:
                            </p>
                            <div className="p-4 rounded-lg bg-zinc-900 border border-zinc-700 font-mono text-xl font-bold text-white tracking-widest inline-block">
                                {submittedFolio}
                            </div>
                            <p className="text-xs text-zinc-400 max-w-md mx-auto">
                                Se ha remitido una constancia a su correo electrónico. Si requiere consultar el estado de su caso, puede contactar directamente a nuestro Delegado de Protección de Datos en <strong>empresa.joyasjp.cl@gmail.com</strong> indicando su número de folio.
                            </p>
                            <Button 
                                variant="outline"
                                onClick={() => {
                                    setSubmittedFolio(null)
                                    setFormData({
                                        fullName: '',
                                        rut: '',
                                        email: '',
                                        phone: '',
                                        rightType: 'acceso',
                                        details: '',
                                        termsAccepted: false,
                                    })
                                }}
                            >
                                Ingresar otra solicitud
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <Card className="border-zinc-800 bg-zinc-950/60">
                        <CardHeader>
                            <CardTitle className="text-lg">Formulario Oficial de Solicitud de Datos Personales</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="fullName">Nombre Completo del Titular *</Label>
                                        <Input
                                            id="fullName"
                                            required
                                            value={formData.fullName}
                                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                            placeholder="Ej. Juan Pérez González"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="rut">RUT / Documento de Identidad *</Label>
                                        <Input
                                            id="rut"
                                            required
                                            value={formData.rut}
                                            onChange={(e) => setFormData({ ...formData, rut: e.target.value })}
                                            placeholder="Ej. 12.345.678-9"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Correo Electrónico de Notificación *</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            required
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            placeholder="nombre@correo.cl"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Teléfono de Contacto (Opcional)</Label>
                                        <Input
                                            id="phone"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            placeholder="+56 9 ..."
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="rightType">Derecho que desea ejercer (Ley N° 21.719) *</Label>
                                    <select
                                        id="rightType"
                                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                                        value={formData.rightType}
                                        onChange={(e) => setFormData({ ...formData, rightType: e.target.value })}
                                    >
                                        <option value="acceso">Acceso (Conocer los datos personales almacenados y su origen)</option>
                                        <option value="rectificacion">Rectificación (Actualizar o corregir datos inexactos o erróneos)</option>
                                        <option value="supresion">Cancelación / Supresión (Eliminar datos que carecen de fundamento legal)</option>
                                        <option value="oposicion">Oposición (Oponerse a un tratamiento particular o marketing)</option>
                                        <option value="bloqueo">Bloqueo Temporal (Suspensión cautelar urgente - 2 días hábiles)</option>
                                        <option value="portabilidad">Portabilidad (Copia digital estructurada e interoperable)</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="details">Detalle y Justificación de la Solicitud *</Label>
                                    <Textarea
                                        id="details"
                                        required
                                        rows={4}
                                        value={formData.details}
                                        onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                                        placeholder="Describa con precisión los datos objeto de la solicitud y las aclaraciones pertinentes..."
                                    />
                                </div>

                                <div className="pt-2">
                                    <label className="flex items-start gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            required
                                            checked={formData.termsAccepted}
                                            onChange={(e) => setFormData({ ...formData, termsAccepted: e.target.checked })}
                                            className="mt-1 h-4 w-4 accent-primary rounded shrink-0"
                                        />
                                        <span className="text-xs text-muted-foreground">
                                            Declaro bajo juramento ser el titular legítimo de los datos o su representante debidamente facultado, y entiendo que Joyas JP podrá requerir acreditar identidad para salvaguardar la confidencialidad de la información.
                                        </span>
                                    </label>
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full font-bold"
                                    disabled={submitting}
                                >
                                    {submitting ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Registrando solicitud...
                                        </>
                                    ) : (
                                        'Ingresar Solicitud Formal ARCOP'
                                    )}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                )}
            </div>
        </LegalLayout>
    )
}
