create table users (
  id bigint primary key generated always as identity,
  email text unique not null,
  name text not null,
  password_hash text not null,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now()
);

create table subscriptions (
  id bigint primary key generated always as identity,
  user_id bigint not null references users(id) on delete cascade,
  plan text not null check (plan in ('monthly', 'yearly')),
  status text not null default 'active' check (status in ('active', 'canceled', 'lapsed')),
  stripe_subscription_id text,
  current_period_end timestamptz,
  charity_id bigint references charities(id) on delete set null,
  charity_pct int not null default 10 check (charity_pct >= 10 and charity_pct <= 100),
  created_at timestamptz not null default now()
);

create table scores (
  id bigint primary key generated always as identity,
  user_id bigint not null references users(id) on delete cascade,
  score int not null check (score >= 1 and score <= 45),
  date date not null,
  created_at timestamptz not null default now(),
  unique(user_id, date)
);

create table draws (
  id bigint primary key generated always as identity,
  month int not null check (month >= 1 and month <= 12),
  year int not null,
  status text not null default 'pending' check (status in ('pending', 'simulated', 'published')),
  draw_type text not null default 'random' check (draw_type in ('random', 'algorithmic')),
  winning_numbers int[] not null default '{}',
  prize_pool_5 numeric(12,2) not null default 0,
  prize_pool_4 numeric(12,2) not null default 0,
  prize_pool_3 numeric(12,2) not null default 0,
  jackpot_rollover numeric(12,2) not null default 0,
  created_at timestamptz not null default now(),
  unique(month, year)
);

create table draw_results (
  id bigint primary key generated always as identity,
  draw_id bigint not null references draws(id) on delete cascade,
  user_id bigint not null references users(id) on delete cascade,
  match_type int not null check (match_type in (3, 4, 5)),
  prize_amount numeric(12,2) not null default 0,
  status text not null default 'pending' check (status in ('pending', 'paid')),
  created_at timestamptz not null default now()
);

create table charities (
  id bigint primary key generated always as identity,
  name text not null,
  description text,
  image_url text,
  website text,
  featured boolean not null default false,
  created_at timestamptz not null default now()
);

create table winners (
  id bigint primary key generated always as identity,
  draw_result_id bigint not null references draw_results(id) on delete cascade,
  user_id bigint not null references users(id) on delete cascade,
  proof_url text,
  admin_status text not null default 'pending' check (admin_status in ('pending', 'approved', 'rejected')),
  payment_status text not null default 'pending' check (payment_status in ('pending', 'paid')),
  created_at timestamptz not null default now()
);

create index idx_scores_user_date on scores(user_id, date desc);
create index idx_subscriptions_user on subscriptions(user_id);
create index idx_draw_results_draw on draw_results(draw_id);
create index idx_draw_results_user on draw_results(user_id);
create index idx_winners_draw_result on winners(draw_result_id);
