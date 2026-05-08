
-- Roles enum & table
create type public.app_role as enum ('admin');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role app_role not null default 'admin',
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  )
$$;

create policy "admins manage roles" on public.user_roles
  for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

create policy "users see own roles" on public.user_roles
  for select to authenticated
  using (user_id = auth.uid());

-- Auto-promote first user to admin
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  if (select count(*) from public.user_roles) = 0 then
    insert into public.user_roles (user_id, role) values (new.id, 'admin');
  end if;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Leads (CRM)
create table public.leads (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  telefone text not null,
  email text not null,
  cidade text,
  como_conheceu text,
  created_at timestamptz not null default now()
);
alter table public.leads enable row level security;

create policy "anyone can insert leads" on public.leads
  for insert to anon, authenticated
  with check (
    char_length(nome) between 2 and 120
    and char_length(telefone) between 8 and 20
    and char_length(email) between 5 and 200
    and (cidade is null or char_length(cidade) <= 120)
    and (como_conheceu is null or char_length(como_conheceu) <= 120)
  );

create policy "admins read leads" on public.leads
  for select to authenticated
  using (public.has_role(auth.uid(), 'admin'));

create policy "admins delete leads" on public.leads
  for delete to authenticated
  using (public.has_role(auth.uid(), 'admin'));

-- Site assets registry (key -> bucket path)
create table public.site_assets (
  id uuid primary key default gen_random_uuid(),
  asset_key text not null unique,
  storage_path text not null,
  alt text,
  updated_at timestamptz not null default now()
);
alter table public.site_assets enable row level security;

create policy "public reads site assets" on public.site_assets
  for select to anon, authenticated using (true);

create policy "admins write site assets" on public.site_assets
  for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- Storage bucket
insert into storage.buckets (id, name, public) values ('site-assets', 'site-assets', true);

create policy "public read site-assets" on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'site-assets');

create policy "admins upload site-assets" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'site-assets' and public.has_role(auth.uid(), 'admin'));

create policy "admins update site-assets" on storage.objects
  for update to authenticated
  using (bucket_id = 'site-assets' and public.has_role(auth.uid(), 'admin'));

create policy "admins delete site-assets" on storage.objects
  for delete to authenticated
  using (bucket_id = 'site-assets' and public.has_role(auth.uid(), 'admin'));
