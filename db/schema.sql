-- ============================================================
-- KSK Foundation — Admin CMS Schema (PostgreSQL / Supabase)
-- Run this in Supabase → SQL Editor (whole file, once)
-- ============================================================

-- Users / Administrators
create table if not exists users (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  email         text unique not null,
  password_hash text not null,
  role          text not null default 'viewer'
                check (role in ('super_admin', 'content_admin', 'viewer')),
  status        text not null default 'active'
                check (status in ('pending', 'active', 'suspended', 'rejected')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Admin applications (public "apply for admin access" form)
create table if not exists admin_applications (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  email         text not null,
  phone         text,
  organization  text,
  reason        text,
  status        text not null default 'pending'
                check (status in ('pending', 'approved', 'rejected')),
  reviewed_by   uuid references users(id),
  reviewed_at   timestamptz,
  created_at    timestamptz not null default now()
);

-- Site images (hero images, section images per page)
create table if not exists images (
  id            uuid primary key default gen_random_uuid(),
  page          text not null,        -- e.g. 'home', 'programs'
  section       text not null,        -- e.g. 'hero', 'gallery-preview'
  title         text,
  storage_path  text not null,        -- path inside the 'images' bucket
  alt_text      text,
  uploaded_by   uuid references users(id),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (page, section)
);

-- Gallery
create table if not exists gallery (
  id            uuid primary key default gen_random_uuid(),
  title         text,
  description   text,
  storage_path  text not null,        -- path inside the 'gallery' bucket
  category      text,
  year          int,
  alt_text      text,
  status        text not null default 'draft'
                check (status in ('draft', 'published')),
  uploaded_by   uuid references users(id),
  created_at    timestamptz not null default now()
);

-- Publications (FOCUS Magazine, Annual Highlights, etc.)
create table if not exists publications (
  id             uuid primary key default gen_random_uuid(),
  title          text not null,
  type           text not null
                 check (type in ('focus_magazine', 'annual_highlights', 'prospectus', 'other')),
  description    text,
  year           int,
  cover_path     text,                -- path inside 'publications' bucket
  document_path  text,                -- path to PDF inside 'publications' bucket
  status         text not null default 'draft'
                 check (status in ('draft', 'published')),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- Contact form submissions
create table if not exists contact_messages (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  email         text not null,
  phone         text,
  organization  text,
  subject       text,
  message       text not null,
  status        text not null default 'unread'
                check (status in ('unread', 'read')),
  created_at    timestamptz not null default now()
);

-- Partnership / "Partner With Us" inquiries
create table if not exists partnership_inquiries (
  id             uuid primary key default gen_random_uuid(),
  name           text not null,
  organization   text,
  email          text not null,
  phone          text,
  interest_area  text
                 check (interest_area in
                   ('Program Sponsorship', 'Scholarship Sponsorship',
                    'Facilitator / Mentor', 'In-Kind Support', 'Other')),
  message        text,
  status         text not null default 'new'
                 check (status in ('new', 'reviewed')),
  created_at     timestamptz not null default now()
);

-- Newsletter subscribers (shared by homepage, footer, contact page forms)
create table if not exists newsletter_subscribers (
  id               uuid primary key default gen_random_uuid(),
  name             text,
  email            text unique not null,
  status           text not null default 'subscribed'
                   check (status in ('subscribed', 'unsubscribed')),
  subscribed_at    timestamptz not null default now(),
  unsubscribed_at  timestamptz
);

-- Alumni testimonials / directory
create table if not exists alumni (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  cohort        text,
  program       text,
  testimonial   text,
  photo_path    text,
  status        text not null default 'draft'
                check (status in ('draft', 'published')),
  created_at    timestamptz not null default now()
);

-- Editable page text content (Phase 3 — homepage titles, section copy, etc.)
create table if not exists page_content (
  id          uuid primary key default gen_random_uuid(),
  page        text not null,
  section     text not null,
  field       text not null,          -- e.g. 'title', 'body'
  value       text,
  updated_by  uuid references users(id),
  updated_at  timestamptz not null default now(),
  unique (page, section, field)
);

create index if not exists idx_gallery_status on gallery(status);
create index if not exists idx_publications_status on publications(status);
create index if not exists idx_contact_status on contact_messages(status);
create index if not exists idx_admin_apps_status on admin_applications(status);

-- NOTE ON STORAGE BUCKETS
-- Create these buckets in Supabase → Storage (Public read, authenticated write):
--   images        (page/section images)
--   gallery       (gallery photos)
--   publications  (cover images + PDFs)
--   alumni        (alumni photos)
