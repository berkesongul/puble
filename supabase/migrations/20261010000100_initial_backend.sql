create extension if not exists pgcrypto;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  avatar_url text,
  locale text not null default 'tr' check (locale in ('tr','en','es','fr','ar')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 120),
  slug text not null unique,
  plan text not null default 'free' check (plan in ('free','creator','pro','studio')),
  owner_id uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.workspace_members (
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('owner','admin','editor','analyst','member')),
  created_at timestamptz not null default now(),
  primary key (workspace_id, user_id)
);

create or replace function public.is_workspace_member(target_workspace_id uuid)
returns boolean language sql stable security definer set search_path = public
as $$ select exists(select 1 from public.workspace_members where workspace_id = target_workspace_id and user_id = auth.uid()) $$;

create or replace function public.is_workspace_admin(target_workspace_id uuid)
returns boolean language sql stable security definer set search_path = public
as $$ select exists(select 1 from public.workspace_members where workspace_id = target_workspace_id and user_id = auth.uid() and role in ('owner','admin')) $$;

create table public.brand_profiles (
  workspace_id uuid primary key references public.workspaces(id) on delete cascade,
  tone text not null default 'Samimi ve profesyonel',
  audience text not null default '',
  description text not null default '',
  preferred_phrases text[] not null default '{}',
  avoided_phrases text[] not null default '{}',
  require_calendar_approval boolean not null default true,
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now()
);

create table public.notification_preferences (
  workspace_id uuid primary key references public.workspaces(id) on delete cascade,
  email boolean not null default true,
  browser boolean not null default true,
  ai_opportunities boolean not null default true,
  publishing boolean not null default true,
  updated_at timestamptz not null default now()
);

create table public.social_accounts (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  provider text not null check (provider in ('instagram','threads','linkedin','facebook','bluesky','substack','youtube','tiktok','mastodon','pinterest','google_business','twitter')),
  display_name text not null,
  external_account_id text,
  status text not null default 'connected' check (status in ('connected','expired','revoked','error')),
  metadata jsonb not null default '{}',
  last_synced_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(workspace_id, provider, external_account_id)
);

create table public.social_account_secrets (
  social_account_id uuid primary key references public.social_accounts(id) on delete cascade,
  credentials_ciphertext text not null,
  rotated_at timestamptz not null default now()
);

create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  social_account_id uuid references public.social_accounts(id) on delete set null,
  external_id text,
  participant_name text not null,
  participant_handle text not null default '',
  participant_avatar_url text,
  status text not null default 'active' check (status in ('active','archived','spam')),
  unread_count integer not null default 0 check (unread_count >= 0),
  last_message_preview text not null default '',
  last_message_at timestamptz not null default now(),
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(workspace_id, social_account_id, external_id)
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid references auth.users(id) on delete set null,
  direction text not null check (direction in ('inbound','outbound')),
  kind text not null default 'text' check (kind in ('text','image','video','file')),
  body text not null,
  external_id text,
  status text not null default 'sent' check (status in ('queued','sent','delivered','read','failed')),
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table public.content_opportunities (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  conversation_id uuid references public.conversations(id) on delete set null,
  title text not null,
  description text not null default '',
  suggested_at timestamptz,
  channel_keys text[] not null default '{}',
  status text not null default 'suggested' check (status in ('suggested','accepted','dismissed')),
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  author_id uuid references auth.users(id) on delete set null,
  opportunity_id uuid references public.content_opportunities(id) on delete set null,
  series_id uuid,
  title text not null,
  body text not null default '',
  status text not null default 'draft' check (status in ('draft','scheduled','publishing','published','failed')),
  scheduled_at timestamptz,
  published_at timestamptz,
  channel_keys text[] not null default '{}',
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.media_assets (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  created_by uuid references auth.users(id) on delete set null,
  title text not null,
  kind text not null check (kind in ('image','video','document')),
  storage_path text not null,
  mime_type text not null,
  bytes bigint not null default 0 check (bytes >= 0),
  width integer,
  height integer,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table public.post_assets (
  post_id uuid not null references public.posts(id) on delete cascade,
  asset_id uuid not null references public.media_assets(id) on delete cascade,
  position integer not null default 0,
  primary key(post_id, asset_id)
);

create table public.publication_jobs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  post_id uuid not null references public.posts(id) on delete cascade,
  social_account_id uuid not null references public.social_accounts(id) on delete cascade,
  status text not null default 'queued' check (status in ('queued','processing','published','failed')),
  attempts integer not null default 0 check (attempts >= 0),
  next_attempt_at timestamptz not null default now(),
  external_post_id text,
  error_code text,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(post_id, social_account_id)
);

create table public.series (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  description text not null default '',
  cadence text not null check (cadence in ('daily','weekly','biweekly','monthly','custom')),
  channel_keys text[] not null default '{}',
  next_run_at timestamptz,
  active boolean not null default true,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.posts add constraint posts_series_id_fkey foreign key (series_id) references public.series(id) on delete set null;

create table public.campaigns (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  provider text not null,
  status text not null default 'draft' check (status in ('draft','active','paused','completed')),
  budget numeric(14,2) not null default 0 check (budget >= 0),
  currency char(3) not null default 'TRY',
  starts_at timestamptz,
  ends_at timestamptz,
  metrics jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.analytics_daily (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  social_account_id uuid references public.social_accounts(id) on delete cascade,
  day date not null,
  impressions bigint not null default 0,
  reach bigint not null default 0,
  engagements bigint not null default 0,
  followers bigint not null default 0,
  clicks bigint not null default 0,
  metadata jsonb not null default '{}',
  unique(workspace_id, social_account_id, day)
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  category text not null check (category in ('ai','inbox','schedule','series','system')),
  title text not null,
  body text not null default '',
  read_at timestamptz,
  target text,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table public.usage_counters (
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  period_start date not null,
  active_conversations integer not null default 0,
  ai_requests integer not null default 0,
  storage_bytes bigint not null default 0,
  published_posts integer not null default 0,
  primary key(workspace_id, period_start)
);

create table public.audit_logs (
  id bigint generated always as identity primary key,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table public.creator_profiles (
  id uuid primary key default gen_random_uuid(),
  handle text not null unique,
  display_name text not null,
  bio text not null default '',
  avatar_url text,
  follower_count bigint not null default 0,
  verified boolean not null default false,
  categories text[] not null default '{}',
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.creator_templates (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references public.creator_profiles(id) on delete cascade,
  title text not null,
  body text not null default '',
  channel_keys text[] not null default '{}',
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table public.creator_follows (
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  creator_id uuid not null references public.creator_profiles(id) on delete cascade,
  followed_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  primary key(workspace_id, creator_id)
);

create index conversations_workspace_recent_idx on public.conversations(workspace_id, last_message_at desc);
create index messages_conversation_recent_idx on public.messages(conversation_id, created_at desc);
create index posts_workspace_status_idx on public.posts(workspace_id, status, scheduled_at);
create index notifications_workspace_recent_idx on public.notifications(workspace_id, created_at desc);
create index analytics_workspace_day_idx on public.analytics_daily(workspace_id, day desc);
create index creator_templates_creator_idx on public.creator_templates(creator_id, created_at desc);
create index publication_jobs_queue_idx on public.publication_jobs(status, next_attempt_at);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$ begin new.updated_at = now(); return new; end $$;

do $$ declare table_name text; begin
  foreach table_name in array array['profiles','workspaces','brand_profiles','notification_preferences','social_accounts','conversations','content_opportunities','posts','series','campaigns','publication_jobs'] loop
    execute format('create trigger set_%I_updated_at before update on public.%I for each row execute function public.set_updated_at()', table_name, table_name);
  end loop;
end $$;

create trigger set_creator_profiles_updated_at before update on public.creator_profiles for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare new_workspace_id uuid; workspace_slug text;
begin
  insert into public.profiles(id, full_name)
  values(new.id, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)));
  workspace_slug := lower(regexp_replace(coalesce(new.raw_user_meta_data->>'workspace_name', split_part(new.email, '@', 1)), '[^a-zA-Z0-9]+', '-', 'g')) || '-' || substr(new.id::text, 1, 8);
  insert into public.workspaces(name, slug, owner_id)
  values(coalesce(new.raw_user_meta_data->>'workspace_name', 'Çalışma Alanım'), workspace_slug, new.id)
  returning id into new_workspace_id;
  insert into public.workspace_members(workspace_id, user_id, role) values(new_workspace_id, new.id, 'owner');
  insert into public.brand_profiles(workspace_id, updated_by) values(new_workspace_id, new.id);
  insert into public.notification_preferences(workspace_id) values(new_workspace_id);
  insert into public.usage_counters(workspace_id, period_start) values(new_workspace_id, date_trunc('month', now())::date);
  return new;
end $$;

alter table public.creator_profiles enable row level security;
alter table public.creator_templates enable row level security;
alter table public.creator_follows enable row level security;
create policy creators_authenticated_select on public.creator_profiles for select to authenticated using (true);
create policy creator_templates_authenticated_select on public.creator_templates for select to authenticated using (true);
create policy creator_follows_select on public.creator_follows for select using (public.is_workspace_member(workspace_id));
create policy creator_follows_insert on public.creator_follows for insert with check (public.is_workspace_member(workspace_id));
create policy creator_follows_delete on public.creator_follows for delete using (public.is_workspace_member(workspace_id));

alter table public.social_account_secrets enable row level security;
comment on table public.social_account_secrets is 'Server-only encrypted provider credentials. No user-facing RLS policies by design.';

create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;

create policy profiles_self_select on public.profiles for select using (id = auth.uid());
create policy profiles_self_update on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());
create policy workspaces_member_all on public.workspaces for select using (public.is_workspace_member(id));
create policy workspaces_admin_update on public.workspaces for update using (public.is_workspace_admin(id)) with check (public.is_workspace_admin(id));
create policy members_select on public.workspace_members for select using (public.is_workspace_member(workspace_id));
create policy members_admin_insert on public.workspace_members for insert with check (public.is_workspace_admin(workspace_id));
create policy members_admin_update on public.workspace_members for update using (public.is_workspace_admin(workspace_id)) with check (public.is_workspace_admin(workspace_id));
create policy members_admin_delete on public.workspace_members for delete using (public.is_workspace_admin(workspace_id));

do $$ declare table_name text; begin
  foreach table_name in array array['brand_profiles','notification_preferences','social_accounts','conversations','messages','content_opportunities','posts','media_assets','series','campaigns','analytics_daily','notifications','usage_counters','audit_logs','publication_jobs'] loop
    execute format('alter table public.%I enable row level security', table_name);
    execute format('create policy %I on public.%I for select using (public.is_workspace_member(workspace_id))', table_name || '_select', table_name);
    execute format('create policy %I on public.%I for insert with check (public.is_workspace_member(workspace_id))', table_name || '_insert', table_name);
    execute format('create policy %I on public.%I for update using (public.is_workspace_member(workspace_id)) with check (public.is_workspace_member(workspace_id))', table_name || '_update', table_name);
    execute format('create policy %I on public.%I for delete using (public.is_workspace_member(workspace_id))', table_name || '_delete', table_name);
  end loop;
end $$;

alter table public.post_assets enable row level security;
create policy post_assets_member_all on public.post_assets for all
using (exists(select 1 from public.posts p where p.id = post_id and public.is_workspace_member(p.workspace_id)))
with check (exists(select 1 from public.posts p where p.id = post_id and public.is_workspace_member(p.workspace_id)));

insert into storage.buckets(id, name, public, file_size_limit, allowed_mime_types)
values('workspace-media', 'workspace-media', false, 104857600, array['image/jpeg','image/png','image/webp','image/gif','video/mp4','video/webm','application/pdf'])
on conflict(id) do nothing;

create policy workspace_media_select on storage.objects for select using (
  bucket_id = 'workspace-media' and (storage.foldername(name))[1] in (select workspace_id::text from public.workspace_members where user_id = auth.uid())
);
create policy workspace_media_insert on storage.objects for insert with check (
  bucket_id = 'workspace-media' and (storage.foldername(name))[1] in (select workspace_id::text from public.workspace_members where user_id = auth.uid())
);
create policy workspace_media_update on storage.objects for update using (
  bucket_id = 'workspace-media' and (storage.foldername(name))[1] in (select workspace_id::text from public.workspace_members where user_id = auth.uid())
) with check (
  bucket_id = 'workspace-media' and (storage.foldername(name))[1] in (select workspace_id::text from public.workspace_members where user_id = auth.uid())
);
create policy workspace_media_delete on storage.objects for delete using (
  bucket_id = 'workspace-media' and (storage.foldername(name))[1] in (select workspace_id::text from public.workspace_members where user_id = auth.uid())
);

alter publication supabase_realtime add table public.notifications, public.messages, public.posts;
