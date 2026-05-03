-- ============================================================
-- Patch 001 — Políticas DELETE para jogadores
-- Execute no SQL Editor do Supabase Dashboard
-- ============================================================

-- Permite que participantes excluam partidas ainda não encerradas
CREATE POLICY "Players delete own scheduled matches" ON matches
  FOR DELETE USING (
    auth.uid() IN (
      SELECT p.user_id FROM players p
      WHERE p.id = player1_id OR p.id = player2_id
    )
    AND status IN ('scheduled', 'pending_result')
  );

-- Permite que participantes excluam os sets das suas próprias partidas
-- (necessário para editar resultados já registrados)
CREATE POLICY "Players delete own match sets" ON match_sets
  FOR DELETE USING (
    auth.uid() IN (
      SELECT p.user_id FROM players p
      JOIN matches m ON (m.player1_id = p.id OR m.player2_id = p.id)
      WHERE m.id = match_id
    )
  );
