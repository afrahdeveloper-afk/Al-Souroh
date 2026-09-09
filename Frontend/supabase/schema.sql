-- Al-Souroh — Supabase schema
--
-- Replaces the Django backend (Backend/) that used to serve this data.
-- Run this once, whole, in the Supabase project's SQL editor (Dashboard →
-- SQL Editor → New query). Re-running is not idempotent (tables/policies
-- already existing will error) — drop them first if you need to re-apply.
--
-- Singleton tables (general_information, contact_us, and the six
-- *_images tables) are always upserted at a fixed id = 1 by the app —
-- the `check (id = 1)` constraint just makes that the only possible value
-- rather than relying on app code alone.

-- ============================================================
-- general_information — powers the public Hero
-- ============================================================
create table public.general_information (
  id bigint primary key check (id = 1),
  main_title text not null,
  main_title_ar text not null,
  second_title text not null,
  second_title_ar text not null,
  description text not null,
  description_ar text not null,
  hero_img text not null
);

-- ============================================================
-- contact_us
-- ============================================================
create table public.contact_us (
  id bigint primary key check (id = 1),
  phone_number text not null,
  whatsapp_number text not null,
  google_map_link text not null,
  email text,
  address text not null,
  address_ar text not null,
  work_days text not null,
  work_days_ar text,
  work_hours text not null,
  instagram_user text not null,
  facebook_user text not null,
  tiktok_user text not null
);

-- ============================================================
-- services
-- ============================================================
create table public.services (
  id bigint generated always as identity primary key,
  service_name text not null,
  service_name_ar text not null,
  service_description text not null,
  service_description_ar text not null,
  service_rank text not null,
  service_rank_ar text not null,
  service_priority integer not null default 0,
  service_problems text[] not null check (array_length(service_problems, 1) > 0),
  service_problems_ar text[] not null check (array_length(service_problems_ar, 1) > 0),
  service_procedures text[] not null check (array_length(service_procedures, 1) > 0),
  service_procedures_ar text[] not null check (array_length(service_procedures_ar, 1) > 0),
  img text not null
);

-- ============================================================
-- project_categories / projects
-- ============================================================
create table public.project_categories (
  id uuid primary key default gen_random_uuid(),
  category_name text not null,
  category_name_ar text not null
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.project_categories(id) on delete restrict,
  project_name text not null,
  project_name_ar text not null,
  car_model text not null,
  date date not null,
  project_description text not null,
  project_description_ar text not null,
  cover_img text,
  before_img text,
  after_img text
);

-- ============================================================
-- news
-- ============================================================
create table public.news (
  id bigint generated always as identity primary key,
  news_title text not null,
  news_title_ar text not null,
  news_description text not null,
  news_description_ar text not null,
  news_content text not null,
  news_content_ar text not null,
  news_img text not null,
  is_featured boolean not null default false,
  created_at timestamptz not null default now()
);

-- Only one News row may be featured at a time — matches News.save() in the
-- old Django model, which force-unset every other row on save.
create function public.enforce_single_featured_news()
returns trigger
language plpgsql
as $$
begin
  if new.is_featured then
    update public.news set is_featured = false where id != new.id and is_featured;
  end if;
  return new;
end;
$$;

create trigger news_single_featured
  before insert or update on public.news
  for each row execute function public.enforce_single_featured_news();

-- ============================================================
-- static images — six singleton groups, id fixed to 1 each
-- ============================================================
create table public.home_page_images (
  id bigint primary key check (id = 1),
  first_step_image text not null,
  second_step_image text not null,
  third_step_image text not null,
  fourth_step_image text not null,
  story_image text not null,
  case_study_before_image text not null,
  case_study_after_image text not null,
  process_image_first text not null,
  process_image_second text not null,
  process_image_third text not null,
  process_image_fourth text not null,
  process_image_fifth text not null,
  process_image_sixth text not null,
  end_image text not null
);

create table public.about_us_images (
  id bigint primary key check (id = 1),
  main_image text not null,
  center_image_first text not null,
  center_image_second text not null,
  center_image_third text not null,
  center_image_fourth text not null
);

create table public.services_page_image (
  id bigint primary key check (id = 1),
  main_image text not null
);

create table public.projects_page_image (
  id bigint primary key check (id = 1),
  main_image text not null
);

create table public.news_page_image (
  id bigint primary key check (id = 1),
  main_image text not null
);

create table public.contact_us_page_image (
  id bigint primary key check (id = 1),
  main_image text not null
);

-- ============================================================
-- Row Level Security — identical shape on every table:
-- anyone can read, only a signed-in (Supabase Auth) user can write.
-- Matches the old Django views' IsAuthenticatedOrReadOnly, confirmed
-- identical across all 6 apps.
-- ============================================================
do $$
declare
  t text;
begin
  foreach t in array array[
    'general_information', 'contact_us', 'services', 'project_categories',
    'projects', 'news', 'home_page_images', 'about_us_images',
    'services_page_image', 'projects_page_image', 'news_page_image',
    'contact_us_page_image'
  ]
  loop
    execute format('alter table public.%I enable row level security;', t);
    execute format(
      'create policy "Public read access" on public.%I for select to anon, authenticated using (true);',
      t
    );
    execute format(
      'create policy "Authenticated write access" on public.%I for all to authenticated using (true) with check (true);',
      t
    );
  end loop;
end $$;

-- ============================================================
-- Storage — one public bucket for every uploaded image.
-- ============================================================
insert into storage.buckets (id, name, public, allowed_mime_types)
values (
  'media',
  'media',
  true,
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
);

create policy "Public media read access"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'media');

create policy "Authenticated media write access"
  on storage.objects for all
  to authenticated
  using (bucket_id = 'media')
  with check (bucket_id = 'media');
