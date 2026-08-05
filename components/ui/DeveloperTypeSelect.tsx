export const typesDeveloppeur = ["Front-end", "Back-end", "Full stack"] as const

interface DeveloperTypeSelectProps {
  defaultValue?: string | null
  required?: boolean
}

export default function DeveloperTypeSelect({ defaultValue = "", required = false }: DeveloperTypeSelectProps) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-dark">Type de développeur</span>
      <select
        name="developer_type"
        defaultValue={defaultValue ?? ""}
        required={required}
        className="mt-2 h-11 w-full rounded-lg border border-border bg-white px-4 text-sm text-dark outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/10"
      >
        <option value="">Sélectionnez votre spécialité</option>
        {typesDeveloppeur.map((type) => (
          <option key={type} value={type}>
            {type}
          </option>
        ))}
      </select>
    </label>
  )
}
