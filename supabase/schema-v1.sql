-- OkeTech V1 - Schema Supabase
-- A executer dans Supabase SQL Editor.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  role text check (role in ('developpeur', 'investisseur', 'entreprise')) not null,
  nom text not null,
  prenom text,
  email text not null,
  telephone text,
  indicatif text,
  pays text default 'Gabon',
  bio text,
  avatar_url text,
  developer_type text check (developer_type in ('Front-end', 'Back-end', 'Full stack') or developer_type is null),
  skills text[] default '{}',
  score integer default 0 check (score >= 0 and score <= 100),
  verifie boolean default false,
  premium boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.projets (
  id uuid default gen_random_uuid() primary key,
  developpeur_id uuid references public.profiles(id) on delete cascade not null,
  titre text not null,
  description text not null,
  probleme text,
  solution text,
  secteur text not null,
  pays text not null,
  budget_cible bigint not null,
  financement_pct integer default 0 check (financement_pct >= 0 and financement_pct <= 100),
  statut text default 'actif' check (statut in ('brouillon', 'actif', 'financé', 'archive')),
  image_url text,
  dossier_url text,
  score integer default 0 check (score >= 0 and score <= 100),
  sponsored boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.acces_dossiers (
  id uuid default gen_random_uuid() primary key,
  investisseur_id uuid references public.profiles(id) on delete cascade not null,
  projet_id uuid references public.projets(id) on delete cascade not null,
  montant integer not null default 25000,
  mode_paiement text check (mode_paiement in ('airtel', 'moov', 'carte')),
  statut text default 'en_attente' check (statut in ('en_attente', 'confirme', 'rembourse')),
  deal_amount bigint,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(investisseur_id, projet_id)
);

create table if not exists public.messages (
  id uuid default gen_random_uuid() primary key,
  expediteur uuid references public.profiles(id) on delete cascade not null,
  destinataire uuid references public.profiles(id) on delete cascade not null,
  contenu text not null,
  lu boolean default false,
  edited_at timestamptz,
  deleted_at timestamptz,
  created_at timestamptz default now()
);

create table if not exists public.offres (
  id uuid default gen_random_uuid() primary key,
  entreprise_id uuid references public.profiles(id) on delete cascade not null,
  titre text not null,
  description text not null,
  type_contrat text,
  technologies text[],
  localisation text,
  salaire_min bigint,
  salaire_max bigint,
  statut text default 'active',
  sponsored boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

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

alter table public.profiles add column if not exists premium boolean default false;
alter table public.profiles add column if not exists skills text[] default '{}';
alter table public.profiles add column if not exists developer_type text;
alter table public.projets add column if not exists probleme text;
alter table public.projets add column if not exists solution text;
alter table public.projets add column if not exists image_url text;
alter table public.projets add column if not exists dossier_url text;
alter table public.projets add column if not exists sponsored boolean default false;
alter table public.offres add column if not exists sponsored boolean default false;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

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

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists projets_set_updated_at on public.projets;
create trigger projets_set_updated_at
before update on public.projets
for each row execute function public.set_updated_at();

drop trigger if exists acces_dossiers_set_updated_at on public.acces_dossiers;
create trigger acces_dossiers_set_updated_at
before update on public.acces_dossiers
for each row execute function public.set_updated_at();

drop trigger if exists offres_set_updated_at on public.offres;
create trigger offres_set_updated_at
before update on public.offres
for each row execute function public.set_updated_at();

drop trigger if exists transactions_revenus_set_updated_at on public.transactions_revenus;
create trigger transactions_revenus_set_updated_at
before update on public.transactions_revenus
for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.projets enable row level security;
alter table public.acces_dossiers enable row level security;
alter table public.messages enable row level security;
alter table public.offres enable row level security;
alter table public.transactions_revenus enable row level security;

drop policy if exists "profiles_public_read" on public.profiles;
create policy "profiles_public_read" on public.profiles
for select using (true);

drop policy if exists "profiles_owner_insert" on public.profiles;
create policy "profiles_owner_insert" on public.profiles
for insert with check (auth.uid() = id);

drop policy if exists "profiles_owner_update" on public.profiles;
create policy "profiles_owner_update" on public.profiles
for update using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "projets_public_read" on public.projets;
create policy "projets_public_read" on public.projets
for select using (statut = 'actif' or auth.uid() = developpeur_id);

drop policy if exists "projets_owner_insert" on public.projets;
create policy "projets_owner_insert" on public.projets
for insert with check (auth.uid() = developpeur_id);

drop policy if exists "projets_owner_update" on public.projets;
create policy "projets_owner_update" on public.projets
for update using (auth.uid() = developpeur_id) with check (auth.uid() = developpeur_id);

drop policy if exists "acces_owner_read" on public.acces_dossiers;
create policy "acces_owner_read" on public.acces_dossiers
for select using (
  auth.uid() = investisseur_id
  or exists (
    select 1 from public.projets
    where projets.id = acces_dossiers.projet_id
    and projets.developpeur_id = auth.uid()
  )
);

drop policy if exists "acces_investor_insert" on public.acces_dossiers;
create policy "acces_investor_insert" on public.acces_dossiers
for insert with check (auth.uid() = investisseur_id);

drop policy if exists "acces_investor_update_pending" on public.acces_dossiers;
create policy "acces_investor_update_pending" on public.acces_dossiers
for update using (auth.uid() = investisseur_id) with check (auth.uid() = investisseur_id);

drop policy if exists "messages_participants_read" on public.messages;
create policy "messages_participants_read" on public.messages
for select using (auth.uid() = expediteur or auth.uid() = destinataire);

drop policy if exists "messages_sender_insert" on public.messages;
create policy "messages_sender_insert" on public.messages
for insert with check (auth.uid() = expediteur);

drop policy if exists "messages_recipient_or_sender_update" on public.messages;
create policy "messages_recipient_or_sender_update" on public.messages
for update using (auth.uid() = expediteur or auth.uid() = destinataire);

drop policy if exists "offres_public_read" on public.offres;
create policy "offres_public_read" on public.offres
for select using (statut = 'active' or auth.uid() = entreprise_id);

drop policy if exists "offres_owner_insert" on public.offres;
create policy "offres_owner_insert" on public.offres
for insert with check (auth.uid() = entreprise_id);

drop policy if exists "offres_owner_update" on public.offres;
create policy "offres_owner_update" on public.offres
for update using (auth.uid() = entreprise_id) with check (auth.uid() = entreprise_id);

drop policy if exists "transactions_owner_read" on public.transactions_revenus;
create policy "transactions_owner_read" on public.transactions_revenus
for select using (auth.uid() = user_id);

create index if not exists projets_statut_created_at_idx on public.projets(statut, created_at desc);
create index if not exists projets_sponsored_created_at_idx on public.projets(sponsored, created_at desc);
create index if not exists projets_developpeur_id_idx on public.projets(developpeur_id);
create index if not exists acces_dossiers_investisseur_id_idx on public.acces_dossiers(investisseur_id);
create index if not exists messages_expediteur_destinataire_idx on public.messages(expediteur, destinataire, created_at desc);
create index if not exists offres_entreprise_id_idx on public.offres(entreprise_id);
create index if not exists transactions_revenus_user_id_idx on public.transactions_revenus(user_id, created_at desc);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('project-images', 'project-images', true, 5242880, array['image/png', 'image/jpeg', 'image/webp']),
  ('project-documents', 'project-documents', false, 10485760, array['application/pdf'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "project_images_public_read" on storage.objects;
create policy "project_images_public_read" on storage.objects
for select using (bucket_id = 'project-images');

drop policy if exists "project_images_owner_insert" on storage.objects;
create policy "project_images_owner_insert" on storage.objects
for insert with check (
  bucket_id = 'project-images'
  and auth.role() = 'authenticated'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "project_documents_owner_read" on storage.objects;
create policy "project_documents_owner_read" on storage.objects
for select using (
  bucket_id = 'project-documents'
  and auth.role() = 'authenticated'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "project_documents_owner_insert" on storage.objects;
create policy "project_documents_owner_insert" on storage.objects
for insert with check (
  bucket_id = 'project-documents'
  and auth.role() = 'authenticated'
  and (storage.foldername(name))[1] = auth.uid()::text
);

do $$
begin
  alter table public.profiles drop constraint if exists profiles_text_lengths;
  alter table public.profiles add constraint profiles_text_lengths check (
    char_length(nom) between 1 and 120
    and (prenom is null or char_length(prenom) <= 120)
    and char_length(email) <= 254
    and (telephone is null or char_length(telephone) <= 30)
    and (pays is null or char_length(pays) <= 80)
    and (bio is null or char_length(bio) <= 500)
    and (developer_type is null or developer_type in ('Front-end', 'Back-end', 'Full stack'))
    and coalesce(array_length(skills, 1), 0) <= 20
  );

  if not exists (select 1 from pg_constraint where conname = 'projets_content_limits') then
    alter table public.projets add constraint projets_content_limits check (
      char_length(titre) between 3 and 120
      and char_length(description) between 20 and 1200
      and char_length(secteur) between 2 and 60
      and char_length(pays) between 2 and 80
      and budget_cible > 0
      and (probleme is null or char_length(probleme) <= 1200)
      and (solution is null or char_length(solution) <= 1200)
    );
  end if;

  if not exists (select 1 from pg_constraint where conname = 'acces_dossiers_positive_amounts') then
    alter table public.acces_dossiers add constraint acces_dossiers_positive_amounts check (
      montant > 0 and (deal_amount is null or deal_amount > 0)
    );
  end if;

  if not exists (select 1 from pg_constraint where conname = 'messages_content_limits') then
    alter table public.messages add constraint messages_content_limits check (
      char_length(contenu) between 1 and 2000
    );
  end if;

  if not exists (select 1 from pg_constraint where conname = 'offres_content_limits') then
    alter table public.offres add constraint offres_content_limits check (
      char_length(titre) between 3 and 120
      and char_length(description) between 20 and 2000
      and (type_contrat is null or char_length(type_contrat) <= 40)
      and (localisation is null or char_length(localisation) <= 120)
      and (salaire_min is null or salaire_min >= 0)
      and (salaire_max is null or salaire_max >= 0)
    );
  end if;
end $$;
