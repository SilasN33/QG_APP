import type { Match, Standing, Player, GroupLetter } from "@/types";

// Computes standings from match list (pure TypeScript, no extra query needed)
export function computeStandings(
  players: Player[],
  matches: Match[],
  group: GroupLetter
): Standing[] {
  const groupPlayers = players.filter((p) => p.group_letter === group);
  const groupMatches = matches.filter(
    (m) => m.group_letter === group && m.phase === "group"
  );

  const standings: Standing[] = groupPlayers.map((player) => {
    const playerMatches = groupMatches.filter(
      (m) =>
        (m.player1_id === player.id || m.player2_id === player.id) &&
        (m.status === "completed" || m.status === "wo")
    );

    let wins = 0, losses = 0, setsWon = 0, setsLost = 0, gamesWon = 0, gamesLost = 0;

    for (const match of playerMatches) {
      const isP1 = match.player1_id === player.id;
      const won = match.winner_id === player.id;
      if (won) { wins++; } else { losses++; }

      for (const set of match.sets) {
        const myGames = isP1 ? set.player1_games : set.player2_games;
        const oppGames = isP1 ? set.player2_games : set.player1_games;
        if (myGames > oppGames) setsWon++; else setsLost++;
        gamesWon += myGames;
        gamesLost += oppGames;
      }
    }

    return {
      player,
      group_letter: group,
      points: wins * 3,
      wins,
      losses,
      sets_won: setsWon,
      sets_lost: setsLost,
      games_won: gamesWon,
      games_lost: gamesLost,
      matches_played: playerMatches.length,
      position: 0, // filled below
    };
  });

  // Sort: points → wins → set diff → game diff → head-to-head
  standings.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.wins !== a.wins) return b.wins - a.wins;
    const setDiffA = a.sets_won - a.sets_lost;
    const setDiffB = b.sets_won - b.sets_lost;
    if (setDiffB !== setDiffA) return setDiffB - setDiffA;
    const gameDiffA = a.games_won - a.games_lost;
    const gameDiffB = b.games_won - b.games_lost;
    if (gameDiffB !== gameDiffA) return gameDiffB - gameDiffA;
    // Head-to-head
    const h2h = groupMatches.find(
      (m) =>
        ((m.player1_id === a.player.id && m.player2_id === b.player.id) ||
          (m.player1_id === b.player.id && m.player2_id === a.player.id)) &&
        m.status === "completed"
    );
    if (h2h) return h2h.winner_id === a.player.id ? -1 : 1;
    return 0;
  });

  standings.forEach((s, i) => { s.position = i + 1; });
  return standings;
}

export function computeAllStandings(
  players: Player[],
  matches: Match[]
): Standing[] {
  const groups: GroupLetter[] = ["A", "B", "C", "D"];
  return groups.flatMap((g) => computeStandings(players, matches, g));
}

export function computeGlobalRanking(standings: Standing[]): Standing[] {
  return [...standings].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.wins !== a.wins) return b.wins - a.wins;
    const setDiffA = a.sets_won - a.sets_lost;
    const setDiffB = b.sets_won - b.sets_lost;
    if (setDiffB !== setDiffA) return setDiffB - setDiffA;
    return (b.games_won - b.games_lost) - (a.games_won - a.games_lost);
  });
}
