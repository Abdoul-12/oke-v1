export type ValidationResult<T> =
  | { ok: true; value: T }
  | { ok: false; message: string }

const textDangerPattern = /<[^>]*>|javascript:|data:text\/html|on\w+=/i
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const phonePattern = /^[0-9\s().-]{6,20}$/

export function sanitizeText(value: FormDataEntryValue | string | null | undefined, maxLength = 160) {
  return String(value ?? "")
    .normalize("NFKC")
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength)
}

export function sanitizeSearch(value: string, maxLength = 80) {
  return sanitizeText(value, maxLength).replace(/[<>{}[\]`$\\]/g, "")
}

export function validateSafeText(label: string, value: string, minLength = 2, maxLength = 160) {
  const cleaned = sanitizeText(value, maxLength)

  if (cleaned.length < minLength) {
    return { ok: false as const, message: `${label} est trop court.` }
  }

  if (textDangerPattern.test(cleaned)) {
    return { ok: false as const, message: `${label} contient des caractères non autorisés.` }
  }

  return { ok: true as const, value: cleaned }
}

export function validateEmail(value: string) {
  const email = sanitizeText(value, 254).toLowerCase()

  if (!emailPattern.test(email)) {
    return { ok: false as const, message: "Entrez une adresse email valide." }
  }

  return { ok: true as const, value: email }
}

export function validatePhone(value: string) {
  const phone = sanitizeText(value, 24)

  if (!phonePattern.test(phone)) {
    return { ok: false as const, message: "Entrez un numéro de téléphone valide." }
  }

  return { ok: true as const, value: phone }
}

export function validatePassword(value: string) {
  if (value.length < 8) {
    return { ok: false as const, message: "Le mot de passe doit contenir au moins 8 caractères." }
  }

  if (value.length > 128) {
    return { ok: false as const, message: "Le mot de passe est trop long." }
  }

  return { ok: true as const, value }
}

export function validatePositiveAmount(value: string, label = "Le montant") {
  const amount = Number(sanitizeText(value, 32).replace(/\D/g, ""))

  if (!Number.isSafeInteger(amount) || amount <= 0) {
    return { ok: false as const, message: `${label} doit être un nombre positif.` }
  }

  return { ok: true as const, value: amount }
}
