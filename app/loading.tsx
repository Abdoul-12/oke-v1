export default function Loading() {
  return (
    <main className="flex min-h-[55vh] items-center justify-center bg-light px-6 py-12">
      <section className="w-full max-w-[420px] rounded-2xl border border-border bg-white p-6 text-center shadow-sm">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
        <h1 className="mt-5 text-lg font-bold text-dark">Chargement OkeTech</h1>
        <p className="mt-2 text-sm leading-6 text-muted">
          La page se prépare avec les données disponibles.
        </p>
        <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-border">
          <div className="h-full w-2/3 animate-pulse rounded-full bg-primary" />
        </div>
      </section>
    </main>
  )
}
