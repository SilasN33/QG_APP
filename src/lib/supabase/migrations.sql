-- QG Open 2026 - Database Schema

-- Players
create table if not exists players (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  avatar_url text,
  group_letter text not null check (group_letter in ('A','B','C','D')),
  user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz default now()
);

-- Matches
create table if not exists matches (
  id uuid primary key default gen_random_uuid(),
  player1_id uuid not null references players(id),
  player2_id uuid not null references players(id),
  group_letter text check (group_letter in ('A','B','C','D')),
  phase text not null check (phase in (
    'group','quarterfinals','semifinals','final',
    'consolation_quarterfinals','consolation_semifinals','consolation_final'
  )),
  round integer not null default 1,
  scheduled_at timestamptz,
  status text not null default 'scheduled' check (status in ('scheduled','pending_result','completed','wo')),
  winner_id uuid references players(id),
  court text,
  created_at timestamptz default now(),
  constraint different_players check (player1_id <> player2_id)
);

-- Match Sets (scores per set)
create table if not exists match_sets (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references matches(id) on delete cascade,
  set_number integer not null check (set_number between 1 and 3),
  player1_games integer not null default 0,
  player2_games integer not null default 0,
  unique(match_id, set_number)
);

-- Enable RLS
alter table players enable row level security;
alter table matches enable row level security;
alter table match_sets enable row level security;

-- RLS Policies: everyone can read
create policy "Public read players" on players for select using (true);
create policy "Public read matches" on matches for select using (true);
create policy "Public read match_sets" on match_sets for select using (true);

-- Auth users can update their own match results
create policy "Players can submit results" on matches
  for update using (
    auth.uid() in (
      select user_id from players where id = player1_id or id = player2_id
    )
  );

create policy "Players can insert sets" on match_sets
  for insert with check (
    auth.uid() in (
      select p.user_id from players p
      join matches m on (m.player1_id = p.id or m.player2_id = p.id)
      where m.id = match_id
    )
  );

-- Computed standings view
create or replace view group_standings as
select
  p.id as player_id,
  p.name,
  p.avatar_url,
  p.group_letter,
  count(m.id) filter (where m.status = 'completed') as matches_played,
  count(m.id) filter (where m.status = 'completed' and m.winner_id = p.id) * 3 +
  count(m.id) filter (where m.status = 'wo' and m.winner_id = p.id) * 3 as points,
  count(m.id) filter (where m.status in ('completed','wo') and m.winner_id = p.id) as wins,
  count(m.id) filter (where m.status in ('completed','wo') and m.winner_id is not null and m.winner_id <> p.id) as losses,
  coalesce(sum(
    case when m.player1_id = p.id then s.player1_wins else s.player2_wins end
  ), 0) as sets_won,
  coalesce(sum(
    case when m.player1_id = p.id then s.player2_wins else s.player1_wins end
  ), 0) as sets_lost,
  coalesce(sum(
    case when m.player1_id = p.id then s.player1_games else s.player2_games end
  ), 0) as games_won,
  coalesce(sum(
    case when m.player1_id = p.id then s.player2_games else s.player1_games end
  ), 0) as games_lost
from players p
left join matches m on (m.player1_id = p.id or m.player2_id = p.id)
  and m.phase = 'group'
left join lateral (
  select
    count(*) filter (where ms.player1_games > ms.player2_games) as player1_wins,
    count(*) filter (where ms.player2_games > ms.player1_games) as player2_wins,
    sum(ms.player1_games) as player1_games,
    sum(ms.player2_games) as player2_games
  from match_sets ms where ms.match_id = m.id
) s on true
group by p.id, p.name, p.avatar_url, p.group_letter
order by p.group_letter, points desc, wins desc;

-- Seed: 16 players across 4 groups
insert into players (name, group_letter) values
  ('João Silva', 'A'),
  ('Lucas Mendes', 'A'),
  ('Gabriel Rocha', 'A'),
  ('Thiago Oliveira', 'A'),
  ('Pedro Alencar', 'B'),
  ('Rafael Costa', 'B'),
  ('Matheus Lima', 'B'),
  ('Bruno Santos', 'B'),
  ('Carlos Ferreira', 'C'),
  ('Diego Souza', 'C'),
  ('Felipe Martins', 'C'),
  ('Henrique Alves', 'C'),
  ('Igor Pereira', 'D'),
  ('Jorge Nascimento', 'D'),
  ('Leandro Carvalho', 'D'),
  ('Marcos Ribeiro', 'D')
on conflict do nothing;
