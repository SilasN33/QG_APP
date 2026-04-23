export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      players: {
        Row: {
          id: string;
          name: string;
          avatar_url: string | null;
          group_letter: string;
          user_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          avatar_url?: string | null;
          group_letter: string;
          user_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          avatar_url?: string | null;
          group_letter?: string;
          user_id?: string | null;
          created_at?: string;
        };
      };
      matches: {
        Row: {
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
        Insert: {
          id?: string;
          player1_id: string;
          player2_id: string;
          group_letter?: string | null;
          phase: string;
          round?: number;
          scheduled_at?: string | null;
          status?: string;
          winner_id?: string | null;
          court?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          player1_id?: string;
          player2_id?: string;
          group_letter?: string | null;
          phase?: string;
          round?: number;
          scheduled_at?: string | null;
          status?: string;
          winner_id?: string | null;
          court?: string | null;
          created_at?: string;
        };
      };
      match_sets: {
        Row: {
          id: string;
          match_id: string;
          set_number: number;
          player1_games: number;
          player2_games: number;
        };
        Insert: {
          id?: string;
          match_id: string;
          set_number: number;
          player1_games: number;
          player2_games: number;
        };
        Update: {
          id?: string;
          match_id?: string;
          set_number?: number;
          player1_games?: number;
          player2_games?: number;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
};
