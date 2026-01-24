export default function Loading() {
    return (
        <div className="flex h-[50vh] w-full items-center justify-center">
            <div className="flex flex-col items-center gap-2">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-zinc-200 border-t-primary" />
                <p className="animate-pulse text-sm font-medium text-muted-foreground">
                    Cargando...
                </p>
            </div>
        </div>
    )
}
