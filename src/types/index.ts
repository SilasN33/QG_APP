export type GroupLetter = "A" | "B" | "C" | "D";

export type MatchStatus = "scheduled" | "pending_result" | "completed" | "wo";

export type MatchPhase =
  | "group"
  | "quarterfinals"
  | "semifinals"
  | "final"
  | "consolation_quarterfinals"
  | "consolation_semifinals"
  | "consolation_final";

export type ResultStatus = "victory" | "defeat" | "wo" | "pending";

export interface Player {
  id: string;
  name: string;
  avatar_url: string | null;
  group_letter: GroupLetter;
  user_id: string | null;
  created_at: string;
}

export interface Group {
  letter: GroupLetter;
  players: Player[];
}

export interface SetScore {
  id: string;
  match_id: string;
  set_number: number;
  player1_games: number;
  player2_games: number;
}

export interface Match {
  id: string;
  player1_id: string;
  player2_id: string;
  player1?: Player;
  player2?: Player;
  group_letter: GroupLetter | null;
  phase: MatchPhase;
  round: number;
  scheduled_at: string | null;
  status: MatchStatus;
  winner_id: string | null;
  sets: SetScore[];
  court: string | null;
}

export interface Standing {
  player: Player;
  group_letter: GroupLetter;
  points: number;
  wins: number;
  losses: number;
  sets_won: number;
  sets_lost: number;
  games_won: number;
  games_lost: number;
  matches_played: number;
  position: number;
}

export interface BracketSlot {
  position: number;
  player: Player | null;
  match_id: string | null;
}
