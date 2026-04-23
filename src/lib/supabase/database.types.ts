export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type PlayerRow = {
  id: string;
  name: string;
  avatar_url: string | null;
  group_letter: string;
  user_id: string | null;
  created_at: string;
};

export type MatchRow = {
  id: string;
  player1_id: string;
  player2_id: string;
  group_letter: string | null;
  phase: string;
  round: number;
  scheduled_at: string | null;
  status: string;
  winner_id: string | null;
  court: string | null;
  created_at: string;
};

export type MatchSetRow = {
  id: string;
  match_id: string;
  set_number: number;
  player1_games: number;
  player2_games: number;
};

// Minimal Database type required by @supabase/ssr
export type Database = {
  public: {
    Tables: {
      players: {
        Row: PlayerRow;
        Insert: Omit<PlayerRow, "id" | "created_at"> & { id?: string; created_at?: string };
        Update: Partial<PlayerRow>;
        Relationships: never[];
      };
      matches: {
        Row: MatchRow;
        Insert: Omit<MatchRow, "id" | "created_at"> & { id?: string; created_at?: string };
        Update: Partial<MatchRow>;
        Relationships: never[];
      };
      match_sets: {
        Row: MatchSetRow;
        Insert: Omit<MatchSetRow, "id"> & { id?: string };
        Update: Partial<MatchSetRow>;
        Relationships: never[];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
