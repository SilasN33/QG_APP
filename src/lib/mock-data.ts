import type { Player, Match, Standing } from "@/types";

export const MOCK_PLAYERS: Player[] = [
  { id: "p1", name: "João Silva", avatar_url: null, group_letter: "A", user_id: "u1", is_admin: false, created_at: "" },
  { id: "p2", name: "Lucas Mendes", avatar_url: null, group_letter: "A", user_id: null, is_admin: false, created_at: "" },
  { id: "p3", name: "Gabriel Rocha", avatar_url: null, group_letter: "A", user_id: null, is_admin: false, created_at: "" },
  { id: "p4", name: "Thiago Oliveira", avatar_url: null, group_letter: "A", user_id: null, is_admin: false, created_at: "" },
  { id: "p5", name: "Pedro Alencar", avatar_url: null, group_letter: "B", user_id: null, is_admin: false, created_at: "" },
  { id: "p6", name: "Rafael Costa", avatar_url: null, group_letter: "B", user_id: null, is_admin: false, created_at: "" },
  { id: "p7", name: "Matheus Lima", avatar_url: null, group_letter: "B", user_id: null, is_admin: false, created_at: "" },
  { id: "p8", name: "Bruno Santos", avatar_url: null, group_letter: "B", user_id: null, is_admin: false, created_at: "" },
  { id: "p9", name: "Carlos Ferreira", avatar_url: null, group_letter: "C", user_id: null, is_admin: false, created_at: "" },
  { id: "p10", name: "Diego Souza", avatar_url: null, group_letter: "C", user_id: null, is_admin: false, created_at: "" },
  { id: "p11", name: "Felipe Martins", avatar_url: null, group_letter: "C", user_id: null, is_admin: false, created_at: "" },
  { id: "p12", name: "Henrique Alves", avatar_url: null, group_letter: "C", user_id: null, is_admin: false, created_at: "" },
  { id: "p13", name: "Igor Pereira", avatar_url: null, group_letter: "D", user_id: null, is_admin: false, created_at: "" },
  { id: "p14", name: "Jorge Nascimento", avatar_url: null, group_letter: "D", user_id: null, is_admin: false, created_at: "" },
  { id: "p15", name: "Leandro Carvalho", avatar_url: null, group_letter: "D", user_id: null, is_admin: false, created_at: "" },
  { id: "p16", name: "Marcos Ribeiro", avatar_url: null, group_letter: "D", user_id: null, is_admin: false, created_at: "" },
];

const p = (id: string) => MOCK_PLAYERS.find((pl) => pl.id === id)!;

export const MOCK_MATCHES: Match[] = [
  // Grupo A - Round 1
  {
    id: "m1", player1_id: "p1", player2_id: "p3", player1: p("p1"), player2: p("p3"),
    group_letter: "A", phase: "group", round: 1,
    scheduled_at: "2026-05-15T19:00:00", status: "completed", winner_id: "p1",
    sets: [{ id: "s1", match_id: "m1", set_number: 1, player1_games: 6, player2_games: 2 }, { id: "s2", match_id: "m1", set_number: 2, player1_games: 6, player2_games: 4 }],
    court: "Quadra 1",
  },
  {
    id: "m2", player1_id: "p2", player2_id: "p4", player1: p("p2"), player2: p("p4"),
    group_letter: "A", phase: "group", round: 1,
    scheduled_at: "2026-05-15T21:00:00", status: "completed", winner_id: "p2",
    sets: [{ id: "s3", match_id: "m2", set_number: 1, player1_games: 6, player2_games: 1 }, { id: "s4", match_id: "m2", set_number: 2, player1_games: 6, player2_games: 3 }],
    court: "Quadra 2",
  },
  // Grupo A - Round 2
  {
    id: "m3", player1_id: "p3", player2_id: "p4", player1: p("p3"), player2: p("p4"),
    group_letter: "A", phase: "group", round: 2,
    scheduled_at: "2026-05-17T19:30:00", status: "completed", winner_id: "p3",
    sets: [{ id: "s5", match_id: "m3", set_number: 1, player1_games: 7, player2_games: 5 }, { id: "s6", match_id: "m3", set_number: 2, player1_games: 6, player2_games: 4 }],
    court: "Quadra 1",
  },
  {
    id: "m4", player1_id: "p1", player2_id: "p2", player1: p("p1"), player2: p("p2"),
    group_letter: "A", phase: "group", round: 2,
    scheduled_at: "2026-05-18T19:00:00", status: "completed", winner_id: "p1",
    sets: [{ id: "s7", match_id: "m4", set_number: 1, player1_games: 6, player2_games: 4 }, { id: "s8", match_id: "m4", set_number: 2, player1_games: 3, player2_games: 6 }, { id: "s9", match_id: "m4", set_number: 3, player1_games: 6, player2_games: 2 }],
    court: "Quadra 2",
  },
  // Grupo A - Round 3
  {
    id: "m5", player1_id: "p1", player2_id: "p4", player1: p("p1"), player2: p("p4"),
    group_letter: "A", phase: "group", round: 3,
    scheduled_at: "2026-05-20T19:00:00", status: "scheduled", winner_id: null,
    sets: [], court: "Quadra 2",
  },
  {
    id: "m6", player1_id: "p2", player2_id: "p3", player1: p("p2"), player2: p("p3"),
    group_letter: "A", phase: "group", round: 3,
    scheduled_at: "2026-05-20T21:00:00", status: "scheduled", winner_id: null,
    sets: [], court: "Quadra 1",
  },
  // Grupo B
  {
    id: "m7", player1_id: "p5", player2_id: "p7", player1: p("p5"), player2: p("p7"),
    group_letter: "B", phase: "group", round: 1,
    scheduled_at: "2026-05-15T18:30:00", status: "completed", winner_id: "p6",
    sets: [{ id: "s10", match_id: "m7", set_number: 1, player1_games: 4, player2_games: 6 }, { id: "s11", match_id: "m7", set_number: 2, player1_games: 3, player2_games: 6 }],
    court: "Quadra 3",
  },
  {
    id: "m8", player1_id: "p6", player2_id: "p8", player1: p("p6"), player2: p("p8"),
    group_letter: "B", phase: "group", round: 1,
    scheduled_at: "2026-05-16T19:30:00", status: "completed", winner_id: "p6",
    sets: [{ id: "s12", match_id: "m8", set_number: 1, player1_games: 6, player2_games: 2 }, { id: "s13", match_id: "m8", set_number: 2, player1_games: 6, player2_games: 4 }],
    court: "Quadra 3",
  },
  {
    id: "m9", player1_id: "p5", player2_id: "p6", player1: p("p5"), player2: p("p6"),
    group_letter: "B", phase: "group", round: 2,
    scheduled_at: "2026-05-21T18:30:00", status: "scheduled", winner_id: null,
    sets: [], court: "Quadra 3",
  },
  // Grupo C
  {
    id: "m10", player1_id: "p9", player2_id: "p11", player1: p("p9"), player2: p("p11"),
    group_letter: "C", phase: "group", round: 1,
    scheduled_at: "2026-05-16T20:00:00", status: "completed", winner_id: "p9",
    sets: [{ id: "s14", match_id: "m10", set_number: 1, player1_games: 6, player2_games: 3 }, { id: "s15", match_id: "m10", set_number: 2, player1_games: 6, player2_games: 1 }],
    court: "Quadra 4",
  },
  {
    id: "m11", player1_id: "p10", player2_id: "p12", player1: p("p10"), player2: p("p12"),
    group_letter: "C", phase: "group", round: 1,
    scheduled_at: "2026-05-17T20:00:00", status: "completed", winner_id: "p10",
    sets: [{ id: "s16", match_id: "m11", set_number: 1, player1_games: 6, player2_games: 4 }, { id: "s17", match_id: "m11", set_number: 2, player1_games: 7, player2_games: 5 }],
    court: "Quadra 4",
  },
  // Grupo D
  {
    id: "m12", player1_id: "p13", player2_id: "p15", player1: p("p13"), player2: p("p15"),
    group_letter: "D", phase: "group", round: 1,
    scheduled_at: "2026-05-16T19:00:00", status: "completed", winner_id: "p13",
    sets: [{ id: "s18", match_id: "m12", set_number: 1, player1_games: 6, player2_games: 2 }, { id: "s19", match_id: "m12", set_number: 2, player1_games: 6, player2_games: 3 }],
    court: "Quadra 1",
  },
  {
    id: "m13", player1_id: "p14", player2_id: "p16", player1: p("p14"), player2: p("p16"),
    group_letter: "D", phase: "group", round: 1,
    scheduled_at: "2026-05-16T21:00:00", status: "completed", winner_id: "p14",
    sets: [{ id: "s20", match_id: "m13", set_number: 1, player1_games: 6, player2_games: 1 }, { id: "s21", match_id: "m13", set_number: 2, player1_games: 6, player2_games: 3 }],
    court: "Quadra 2",
  },
  // Quarterfinals
  {
    id: "m20", player1_id: "p1", player2_id: "p16", player1: p("p1"), player2: p("p16"),
    group_letter: null, phase: "quarterfinals", round: 1,
    scheduled_at: "2026-05-22T17:00:00", status: "scheduled", winner_id: null,
    sets: [], court: "Quadra Central",
  },
  {
    id: "m21", player1_id: "p6", player2_id: "p3", player1: p("p6"), player2: p("p3"),
    group_letter: null, phase: "quarterfinals", round: 1,
    scheduled_at: "2026-05-22T19:00:00", status: "scheduled", winner_id: null,
    sets: [], court: "Quadra Central",
  },
  {
    id: "m22", player1_id: "p9", player2_id: "p14", player1: p("p9"), player2: p("p14"),
    group_letter: null, phase: "quarterfinals", round: 1,
    scheduled_at: "2026-05-22T21:00:00", status: "scheduled", winner_id: null,
    sets: [], court: "Quadra Central",
  },
  {
    id: "m23", player1_id: "p2", player2_id: "p13", player1: p("p2"), player2: p("p13"),
    group_letter: null, phase: "quarterfinals", round: 1,
    scheduled_at: "2026-05-23T17:00:00", status: "scheduled", winner_id: null,
    sets: [], court: "Quadra Central",
  },
];

export const MOCK_STANDINGS: Standing[] = [
  // Group A
  { player: p("p1"), group_letter: "A", points: 9, wins: 3, losses: 0, sets_won: 6, sets_lost: 1, games_won: 36, games_lost: 20, matches_played: 3, position: 1 },
  { player: p("p2"), group_letter: "A", points: 6, wins: 2, losses: 1, sets_won: 5, sets_lost: 3, games_won: 30, games_lost: 22, matches_played: 3, position: 2 },
  { player: p("p3"), group_letter: "A", points: 3, wins: 1, losses: 2, sets_won: 2, sets_lost: 4, games_won: 20, games_lost: 30, matches_played: 3, position: 3 },
  { player: p("p4"), group_letter: "A", points: 0, wins: 0, losses: 3, sets_won: 0, sets_lost: 6, games_won: 15, games_lost: 38, matches_played: 3, position: 4 },
  // Group B
  { player: p("p6"), group_letter: "B", points: 6, wins: 2, losses: 0, sets_won: 4, sets_lost: 0, games_won: 24, games_lost: 10, matches_played: 2, position: 1 },
  { player: p("p5"), group_letter: "B", points: 3, wins: 1, losses: 1, sets_won: 2, sets_lost: 2, games_won: 16, games_lost: 20, matches_played: 2, position: 2 },
  { player: p("p8"), group_letter: "B", points: 0, wins: 0, losses: 1, sets_won: 0, sets_lost: 2, games_won: 6, games_lost: 12, matches_played: 1, position: 3 },
  { player: p("p7"), group_letter: "B", points: 0, wins: 0, losses: 1, sets_won: 0, sets_lost: 2, games_won: 7, games_lost: 12, matches_played: 1, position: 4 },
  // Group C
  { player: p("p9"), group_letter: "C", points: 3, wins: 1, losses: 0, sets_won: 2, sets_lost: 0, games_won: 12, games_lost: 4, matches_played: 1, position: 1 },
  { player: p("p10"), group_letter: "C", points: 3, wins: 1, losses: 0, sets_won: 2, sets_lost: 0, games_won: 13, games_lost: 9, matches_played: 1, position: 2 },
  { player: p("p11"), group_letter: "C", points: 0, wins: 0, losses: 1, sets_won: 0, sets_lost: 2, games_won: 4, games_lost: 12, matches_played: 1, position: 3 },
  { player: p("p12"), group_letter: "C", points: 0, wins: 0, losses: 1, sets_won: 0, sets_lost: 2, games_won: 9, games_lost: 13, matches_played: 1, position: 4 },
  // Group D
  { player: p("p13"), group_letter: "D", points: 3, wins: 1, losses: 0, sets_won: 2, sets_lost: 0, games_won: 12, games_lost: 5, matches_played: 1, position: 1 },
  { player: p("p14"), group_letter: "D", points: 3, wins: 1, losses: 0, sets_won: 2, sets_lost: 0, games_won: 12, games_lost: 4, matches_played: 1, position: 2 },
  { player: p("p15"), group_letter: "D", points: 0, wins: 0, losses: 1, sets_won: 0, sets_lost: 2, games_won: 5, games_lost: 12, matches_played: 1, position: 3 },
  { player: p("p16"), group_letter: "D", points: 0, wins: 0, losses: 1, sets_won: 0, sets_lost: 2, games_won: 4, games_lost: 12, matches_played: 1, position: 4 },
];

export const CURRENT_PLAYER = MOCK_PLAYERS[0]; // João Silva for demo
