import type { Metadata } from "next"
import Image from "next/image"
import ConnexionForm from "@/components/forms/ConnexionForm"

export const metadata: Metadata = {
  title: "Connexion — OkeTech",
  description: "Connectez-vous à votre espace OkeTech.",
}

export default function ConnexionPage() {
  return (
    <main className="min-h-dvh bg-white lg:grid lg:grid-cols-[60%_40%]">
      <section className="relative hidden h-[280px] overflow-hidden bg-dark md:block lg:hidden" aria-label="Talents OkeTech">
        <Image
          src="/auth/connexion-hero.png"
          alt="Développeurs africains travaillant sur une plateforme tech"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[center_58%]"
        />
      </section>

      <section className="relative hidden min-h-screen overflow-hidden bg-dark lg:block" aria-label="Talents OkeTech">
        <Image
          src="/auth/connexion-hero.png"
          alt="Développeurs africains travaillant sur une plateforme tech"
          fill
          priority
          sizes="60vw"
          className="object-contain"
        />
      </section>

      <section className="flex min-h-dvh items-center justify-center px-6 py-10 sm:px-8 md:min-h-[calc(100dvh-280px)] md:py-14 lg:min-h-screen lg:px-14 lg:py-12 xl:px-20">
        <ConnexionForm />
      </section>
    </main>
  )
}
