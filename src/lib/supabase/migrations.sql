-- ============================================================
-- QG Open 2026 — SCHEMA
-- Seguro para executar múltiplas vezes (idempotente)
-- ============================================================

BEGIN;

-- ============================================================
-- 1. Limpar schema anterior
-- ============================================================
DROP TABLE IF EXISTS match_sets CASCADE;
DROP TABLE IF EXISTS matches    CASCADE;
DROP TABLE IF EXISTS players    CASCADE;

-- ============================================================
-- 2. Players
-- ============================================================
CREATE TABLE players (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name         text        NOT NULL,
  avatar_url   text,
  group_letter text        CHECK (group_letter IN ('A','B','C','D')),
  user_id      uuid        REFERENCES auth.users(id) ON DELETE CASCADE,
  is_admin     boolean     NOT NULL DEFAULT false,
  created_at   timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT players_user_id_key UNIQUE (user_id)
);

-- ============================================================
-- 3. Matches
-- ============================================================
CREATE TABLE matches (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  player1_id   uuid        NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  player2_id   uuid        NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  group_letter text        CHECK (group_letter IN ('A','B','C','D')),
  phase        text        NOT NULL CHECK (phase IN (
                             'group','quarterfinals','semifinals','final',
                             'consolation_quarterfinals','consolation_semifinals','consolation_final'
                           )),
  round        integer     NOT NULL DEFAULT 1,
  scheduled_at timestamptz,
  status       text        NOT NULL DEFAULT 'scheduled'
                           CHECK (status IN ('scheduled','pending_result','completed','wo')),
  winner_id    uuid        REFERENCES players(id),
  court        text,
  created_at   timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT different_players CHECK (player1_id <> player2_id)
);

-- ============================================================
-- 4. Match Sets (placar por set)
-- ============================================================
CREATE TABLE match_sets (
  id             uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id       uuid    NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  set_number     integer NOT NULL CHECK (set_number BETWEEN 1 AND 3),
  player1_games  integer NOT NULL DEFAULT 0,
  player2_games  integer NOT NULL DEFAULT 0,
  UNIQUE(match_id, set_number)
);

-- ============================================================
-- 5. Row Level Security
-- ============================================================
ALTER TABLE players    ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches    ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_sets ENABLE ROW LEVEL SECURITY;

-- Leitura pública
CREATE POLICY "Public read players"    ON players    FOR SELECT USING (true);
CREATE POLICY "Public read matches"    ON matches    FOR SELECT USING (true);
CREATE POLICY "Public read match_sets" ON match_sets FOR SELECT USING (true);

-- Jogador cria seu próprio perfil no cadastro
CREATE POLICY "Users can insert own player" ON players
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Jogador edita seu próprio perfil (nome, avatar)
CREATE POLICY "Users can update own player" ON players
  FOR UPDATE USING (auth.uid() = user_id);

-- Admin: acesso total em players
CREATE POLICY "Admins full access players" ON players
  FOR ALL USING (
    EXISTS (SELECT 1 FROM players WHERE user_id = auth.uid() AND is_admin = true)
  );

-- Admin: acesso total em matches
CREATE POLICY "Admins full access matches" ON matches
  FOR ALL USING (
    EXISTS (SELECT 1 FROM players WHERE user_id = auth.uid() AND is_admin = true)
  );

-- Admin: acesso total em match_sets
CREATE POLICY "Admins full access match_sets" ON match_sets
  FOR ALL USING (
    EXISTS (SELECT 1 FROM players WHERE user_id = auth.uid() AND is_admin = true)
  );

-- Jogador registra resultado das suas próprias partidas
CREATE POLICY "Players submit match results" ON matches
  FOR UPDATE USING (
    auth.uid() IN (
      SELECT p.user_id FROM players p
      WHERE p.id = player1_id OR p.id = player2_id
    )
  );

-- Jogador insere sets das suas próprias partidas
CREATE POLICY "Players insert match sets" ON match_sets
  FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT p.user_id FROM players p
      JOIN matches m ON (m.player1_id = p.id OR m.player2_id = p.id)
      WHERE m.id = match_id
    )
  );

COMMIT;

-- ============================================================
-- 6. Tornar-se admin
--    Execute APÓS criar sua conta no app
-- ============================================================
-- UPDATE players SET is_admin = true
--   WHERE user_id = (SELECT id FROM auth.users WHERE email = 'seu@email.com');
