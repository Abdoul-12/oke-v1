# Déploiement OkeTech sur Vercel

## 1. Avant le push GitHub

```bash
npm run lint
npm run build
git status
```

Ne committez jamais `.env.local`. Le fichier est déjà ignoré par `.gitignore`.

## 2. Variables à ajouter dans Vercel

Dans Vercel : Project Settings → Environment Variables.

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SITE_URL=

STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
AIRTEL_MONEY_API_KEY=PENDING
MOOV_MONEY_API_KEY=PENDING
MOBILE_MONEY_WEBHOOK_SECRET=PENDING
```

`NEXT_PUBLIC_SITE_URL` doit devenir l'URL Vercel finale, par exemple :

```env
NEXT_PUBLIC_SITE_URL=https://oketech-v1.vercel.app
```

## 3. Réglages Vercel

- Framework Preset : Next.js
- Install Command : `npm install`
- Build Command : `npm run build`
- Output Directory : laisser vide

## 4. Supabase

Avant le déploiement, exécuter `supabase/update-v1.sql` dans Supabase SQL Editor.

Ensuite, vérifier que les buckets Storage suivants existent :

- `avatars`
- `project-images`
- `project-documents`

Le code peut créer les buckets automatiquement via la service role key, mais les vérifier dans Supabase évite les surprises pendant la soutenance.
