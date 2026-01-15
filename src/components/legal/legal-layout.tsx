import { ReactNode } from 'react'
import { Separator } from '@/components/ui/separator'

interface LegalLayoutProps {
    children: ReactNode
    title: string
    lastUpdated?: string
}

export function LegalLayout({ children, title, lastUpdated }: LegalLayoutProps) {
    return (
        <div className="bg-background min-h-screen">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-28 md:py-36 max-w-4xl">
                <header className="mb-12 text-center md:text-left">
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                        {title}
                    </h1>
                    {lastUpdated && (
                        <p className="text-muted-foreground">
                            Última actualización: {lastUpdated}
                        </p>
                    )}
                </header>

                <Separator className="mb-12" />

                <article className="prose prose-zinc dark:prose-invert max-w-none 
          prose-headings:font-bold prose-headings:tracking-tight
          prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
          prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
          prose-p:text-muted-foreground prose-p:leading-relaxed prose-p:mb-6
          prose-ul:list-disc prose-ul:pl-6 prose-ul:mb-6 prose-ul:text-muted-foreground
          prose-li:mb-2
          prose-strong:text-foreground">
                    {children}
                </article>
            </div>
        </div>
    )
}
