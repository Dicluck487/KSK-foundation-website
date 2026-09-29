-- ============================================================
-- PUBLICATIONS TABLE
-- ============================================================
-- Run this in the Supabase SQL editor (or as a migration).
-- Safe to run once; re-running will error on the existing table,
-- which is expected if it's already there.

create table if not exists publications (
    id           uuid primary key default gen_random_uuid(),
    title        text not null,
    description  text,
    year         integer,                -- still shown on the card, no longer used for sorting
    status       text not null default 'draft'
                 check (status in ('draft', 'published')),
    cover_path   text,                   -- storage path inside the "publications" bucket
    document_path text,                  -- storage path inside the "publications" bucket
    created_at   timestamptz not null default now(),
    updated_at   timestamptz not null default now()
);

-- Keep updated_at current on every edit
create or replace function set_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

drop trigger if exists trg_publications_updated_at on publications;

create trigger trg_publications_updated_at
before update on publications
for each row
execute function set_updated_at();

-- Fast lookup for the published feed (header dropdown + archive page)
create index if not exists idx_publications_status_created
    on publications (status, created_at desc);


-- ============================================================
-- STORAGE BUCKET
-- ============================================================
-- Create a "publications" bucket in Supabase Storage (Dashboard →
-- Storage → New bucket → name: publications → Public bucket: ON).
-- Covers are stored under covers/, documents under documents/.