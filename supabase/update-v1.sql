-- OkeTech V1 - Mise a jour incremental Supabase
-- A executer dans Supabase SQL Editor avant le deploiement Vercel.

create extension if not exists pgcrypto;

alter table public.profiles add column if not exists telephone text;
alter table public.profiles add column if not exists indicatif text;
alter table public.profiles add column if not exists avatar_url text;
alter table public.profiles add column if not exists developer_type text;
alter table public.profiles add column if not exists skills text[] default '{}';
alter table public.messages add column if not exists edited_at timestamp with time zone;
alter table public.messages add column if not exists deleted_at timestamp with time zone;
alter table public.profiles add column if not exists premium boolean default false;
alter table public.profiles add column if not exists updated_at timestamptz default now();

alter table public.projets add column if not exists probleme text;
alter table public.projets add column if not exists solution text;
alter table public.projets add column if not exists image_url text;
alter table public.projets add column if not exists dossier_url text;
alter table public.projets add column if not exists sponsored boolean default false;
alter table public.projets add column if not exists updated_at timestamptz default now();

alter table public.offres add column if not exists sponsored boolean default false;
alter table public.offres add column if not exists updated_at timestamptz default now();

alter table public.acces_dossiers add column if not exists deal_amount bigint;

create table if not exists public.transactions_revenus (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  type text not null check (type in ('dossier', 'boost_projet', 'sponsor_offre', 'pack_investisseur')),
  reference_id uuid,
  montant integer not null,
  mode_paiement text check (mode_paiement in ('airtel', 'moov', 'carte')),
  statut text default 'en_attente' check (statut in ('en_attente', 'confirme', 'rembourse')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.transactions_revenus enable row level security;

drop policy if exists "transactions_owner_read" on public.transactions_revenus;
create policy "transactions_owner_read" on public.transactions_revenus
  for select using (auth.uid() = user_id);

drop policy if exists "profiles_content_limits" on public.profiles;
alter table public.profiles drop constraint if exists profiles_content_limits;
alter table public.profiles add constraint profiles_content_limits check (
  char_length(nom) between 1 and 120
  and (prenom is null or char_length(prenom) <= 120)
  and char_length(email) <= 254
  and (telephone is null or char_length(telephone) <= 30)
  and (pays is null or char_length(pays) <= 80)
  and (bio is null or char_length(bio) <= 500)
  and (developer_type is null or developer_type in ('Front-end', 'Back-end', 'Full stack'))
  and coalesce(array_length(skills, 1), 0) <= 20
);

alter table public.projets drop constraint if exists projets_content_limits;
alter table public.projets add constraint projets_content_limits check (
  char_length(titre) between 3 and 120
  and char_length(description) between 20 and 1200
  and char_length(secteur) between 2 and 80
  and char_length(pays) between 2 and 80
  and budget_cible > 0
  and (probleme is null or char_length(probleme) <= 1200)
  and (solution is null or char_length(solution) <= 1200)
);

alter table public.acces_dossiers drop constraint if exists acces_dossiers_amount_limits;
alter table public.acces_dossiers add constraint acces_dossiers_amount_limits check (
  montant > 0 and (deal_amount is null or deal_amount > 0)
);

create index if not exists profils_role_score_idx on public.profiles(role, score desc);
create index if not exists projets_sponsored_created_at_idx on public.projets(sponsored, created_at desc);
create index if not exists offres_sponsored_created_at_idx on public.offres(sponsored, created_at desc);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (
    id,
    role,
    nom,
    prenom,
    email,
    telephone,
    indicatif,
    pays,
    developer_type,
    skills
  )
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'role', 'developpeur'),
    coalesce(new.raw_user_meta_data ->> 'nom', ''),
    new.raw_user_meta_data ->> 'prenom',
    coalesce(new.email, ''),
    new.raw_user_meta_data ->> 'telephone',
    new.raw_user_meta_data ->> 'indicatif',
    coalesce(new.raw_user_meta_data ->> 'pays', 'Gabon'),
    new.raw_user_meta_data ->> 'developer_type',
    coalesce(
      array(select jsonb_array_elements_text(coalesce(new.raw_user_meta_data -> 'skills', '[]'::jsonb))),
      '{}'::text[]
    )
  )
  on conflict (id) do update set
    role = excluded.role,
    nom = excluded.nom,
    prenom = excluded.prenom,
    email = excluded.email,
    telephone = excluded.telephone,
    indicatif = excluded.indicatif,
    pays = excluded.pays,
    developer_type = excluded.developer_type,
    skills = excluded.skills;

  return new;
end;
$$;
