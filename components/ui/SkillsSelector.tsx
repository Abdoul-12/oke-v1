"use client"

import { useMemo, useState } from "react"

export const competencesDisponibles = [
  "React",
  "Next.js",
  "TypeScript",
  "JavaScript",
  "Node.js",
  "Tailwind CSS",
  "PostgreSQL",
  "Supabase",
  "Firebase",
  "React Native",
  "Python",
  "Django",
  "Laravel",
  "PHP",
  "UI/UX",
  "Figma",
  "Design",
]

interface SkillsSelectorProps {
  label?: string
  selected: string[]
  onChange: (skills: string[]) => void
}

export default function SkillsSelector({
  label = "Compétences",
  selected,
  onChange,
}: SkillsSelectorProps) {
  const [ouvert, setOuvert] = useState(false)
  const [brouillon, setBrouillon] = useState<string[]>(selected)
  const [valide, setValide] = useState(selected.length > 0)

  const resume = useMemo(() => {
    if (selected.length === 0) return "Choisir vos compétences"
    if (selected.length <= 2) return selected.join(", ")
    return `${selected.slice(0, 2).join(", ")} +${selected.length - 2}`
  }, [selected])

  function basculer(skill: string) {
    setBrouillon((actuel) =>
      actuel.includes(skill) ? actuel.filter((item) => item !== skill) : [...actuel, skill],
    )
  }

  function ajouter() {
    onChange(brouillon)
    setValide(brouillon.length > 0)
    setOuvert(false)
  }

  return (
    <div className="relative">
      <label className="mb-1.5 block text-[13px] font-semibold text-dark">{label}</label>
      <button
        type="button"
        onClick={() => {
          setBrouillon(selected)
          setOuvert((etat) => !etat)
        }}
        className="flex h-11 w-full items-center justify-between rounded-lg border border-border bg-white px-4 text-left text-sm text-dark outline-none transition-colors hover:border-primary focus:border-primary focus:ring-2 focus:ring-primary/10"
      >
        <span className={selected.length ? "font-semibold text-dark" : "text-slate-400"}>{resume}</span>
        <span className="text-xs text-muted">▾</span>
      </button>

      {selected.map((skill) => (
        <input key={skill} type="hidden" name="skills" value={skill} />
      ))}

      {ouvert && (
        <div className="absolute left-0 right-0 z-20 mt-2 rounded-xl border border-border bg-white p-4 shadow-xl shadow-slate-900/10">
          <div className="grid max-h-52 gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
            {competencesDisponibles.map((skill) => {
              const actif = brouillon.includes(skill)

              return (
                <label
                  key={skill}
                  className={`flex cursor-pointer items-center justify-between rounded-lg border px-3 py-2 text-sm transition-colors ${
                    actif ? "border-primary bg-primary/10 text-primary" : "border-border text-muted hover:border-primary"
                  }`}
                >
                  <span className="font-semibold">{skill}</span>
                  <input
                    type="checkbox"
                    checked={actif}
                    onChange={() => basculer(skill)}
                    className="h-4 w-4 rounded border-border accent-primary"
                  />
                </label>
              )
            })}
          </div>

          <button
            type="button"
            onClick={ajouter}
            className="mt-4 inline-flex h-10 w-full items-center justify-center rounded-lg bg-primary px-5 text-sm font-semibold text-white transition hover:bg-primary/90"
          >
            Ajouter
          </button>
        </div>
      )}

      {selected.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {selected.map((skill) => (
            <span
              key={skill}
              className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary hover:text-white hover:shadow-sm hover:shadow-primary/20"
            >
              {skill}
            </span>
          ))}
          {valide && <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-primary">✓ Ajouté</span>}
        </div>
      )}
    </div>
  )
}
