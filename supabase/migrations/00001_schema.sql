create table users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  name text not null,
  password_hash text not null,
  role text not null default 'user',
  created_at timestamptz not null default now()
);

create table charities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  image_url text,
  website text,
  featured boolean not null default false,
  created_at timestamptz not null default now()
);

create table subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  plan text not null,
  status text not null default 'active',
  stripe_subscription_id text,
  current_period_end timestamptz,
  charity_id uuid references charities(id) on delete set null,
  charity_pct integer not null default 10,
  created_at timestamptz not null default now()
);

create table scores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  score integer not null,
  date date not null,
  created_at timestamptz not null default now(),
  unique(user_id, date)
);
create index idx_scores_user_date on scores(user_id, date desc);

create table draws (
  id uuid primary key default gen_random_uuid(),
  month integer not null,
  year integer not null,
  status text not null default 'pending',
  draw_type text not null default 'random',
  winning_numbers integer[] default '{}',
  prize_pool_5 numeric(12,2) not null default 0,
  prize_pool_4 numeric(12,2) not null default 0,
  prize_pool_3 numeric(12,2) not null default 0,
  jackpot_rollover numeric(12,2) not null default 0,
  created_at timestamptz not null default now(),
  unique(month, year)
);

create table draw_results (
  id uuid primary key default gen_random_uuid(),
  draw_id uuid not null references draws(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  match_type integer not null,
  prize_amount numeric(12,2) not null default 0,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

create table winners (
  id uuid primary key default gen_random_uuid(),
  draw_result_id uuid not null unique references draw_results(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  proof_url text,
  admin_status text not null default 'pending',
  payment_status text not null default 'pending',
  created_at timestamptz not null default now()
);
