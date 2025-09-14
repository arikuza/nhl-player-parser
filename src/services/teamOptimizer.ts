import { lineCombinations } from '../data/lineCombinations';

export interface Player {
  id: string;
  full_name: string;
  position: string;
  team: string;
  nationality: string;
  overall: string;
  salary?: number;
  card: string;
}

export interface OptimizedLine {
  players: Player[];
  combination?: typeof lineCombinations[0] | null;
  totalOVR: number;
  totalSalary: number;
}

export interface OptimizedTeam {
  forwardLines: OptimizedLine[];
  defenseLines: OptimizedLine[];
  goalies: Player[];
  totalSalary: number;
  totalOVR: number;
  activeCombinations: typeof lineCombinations;
}

// Generate estimated salary based on OVR
const estimateSalary = (overall: number): number => {
  if (overall >= 90) return 10000000 + (overall - 90) * 500000;
  if (overall >= 85) return 5000000 + (overall - 85) * 800000;
  if (overall >= 80) return 2000000 + (overall - 80) * 400000;
  return 750000 + (overall - 70) * 125000;
};

export const optimizeTeam = (
  forwards: Player[],
  defensemen: Player[],
  goalies: Player[]
): OptimizedTeam => {
  // Add estimated salaries
  const forwardsWithSalary = forwards.map(p => ({
    ...p,
    salary: estimateSalary(parseInt(p.overall))
  }));

  const defensemenWithSalary = defensemen.map(p => ({
    ...p,
    salary: estimateSalary(parseInt(p.overall))
  }));

  const goaliesWithSalary = goalies.map(p => ({
    ...p,
    salary: estimateSalary(parseInt(p.overall))
  }));

  // Sort by OVR descending
  const sortedForwards = [...forwardsWithSalary].sort((a, b) =>
    parseInt(b.overall) - parseInt(a.overall)
  );

  const sortedDefensemen = [...defensemenWithSalary].sort((a, b) =>
    parseInt(b.overall) - parseInt(a.overall)
  );

  const sortedGoalies = [...goaliesWithSalary].sort((a, b) =>
    parseInt(b.overall) - parseInt(a.overall)
  );

  // Find best line combinations
  const forwardCombos = lineCombinations.filter(c => c.type === 'forward');
  const defenseCombos = lineCombinations.filter(c => c.type === 'defense');

  // Priority: 2 OVR > 1 OVR > 5 AP > 3 AP > SAL
  const comboPriority = (combo: typeof lineCombinations[0]) => {
    if (combo.boost === '2 OVR') return 10;
    if (combo.boost === '1 OVR') return 8;
    if (combo.boost === '5 AP') return 6;
    if (combo.boost === '3 AP') return 4;
    if (combo.boost.includes('SAL')) return 2;
    return 0;
  };

  const sortedForwardCombos = [...forwardCombos].sort((a, b) =>
    comboPriority(b) - comboPriority(a)
  );

  const sortedDefenseCombos = [...defenseCombos].sort((a, b) =>
    comboPriority(b) - comboPriority(a)
  );

  // Try to build lines with combinations
  const usedPlayers = new Set<string>();
  const forwardLines: OptimizedLine[] = [];
  const activeCombinations: typeof lineCombinations = [];

  // Build first 2 forward lines with best OVR combinations
  for (const combo of sortedForwardCombos) {
    if (forwardLines.length >= 2) break;

    const line: Player[] = [];
    for (const teamReq of combo.teams) {
      const player = sortedForwards.find(p =>
        !usedPlayers.has(p.id) &&
        (p.team === teamReq || p.nationality === teamReq)
      );
      if (player) {
        line.push(player);
      }
    }

    if (line.length === 3) {
      forwardLines.push({
        players: line,
        combination: combo,
        totalOVR: line.reduce((sum, p) => sum + parseInt(p.overall), 0),
        totalSalary: line.reduce((sum, p) => sum + (p.salary || 0), 0)
      });
      line.forEach(p => usedPlayers.add(p.id));
      activeCombinations.push(combo);
    }
  }

  // Fill remaining forward lines with best available players
  while (forwardLines.length < 4) {
    const availableForwards = sortedForwards.filter(p => !usedPlayers.has(p.id));
    const line = availableForwards.slice(0, 3);

    if (line.length < 3) break;

    // Check if this line matches any combination
    let matchingCombo = null;
    for (const combo of forwardCombos) {
      if (activeCombinations.includes(combo)) continue;

      const teamMatches = combo.teams.every((teamReq, i) =>
        line[i] && (line[i].team === teamReq || line[i].nationality === teamReq)
      );

      if (teamMatches) {
        matchingCombo = combo;
        activeCombinations.push(combo);
        break;
      }
    }

    forwardLines.push({
      players: line,
      combination: matchingCombo,
      totalOVR: line.reduce((sum, p) => sum + parseInt(p.overall), 0),
      totalSalary: line.reduce((sum, p) => sum + (p.salary || 0), 0)
    });

    line.forEach(p => usedPlayers.add(p.id));
  }

  // Build defense lines
  const defenseLines: OptimizedLine[] = [];

  // First defense line with best OVR combination
  for (const combo of sortedDefenseCombos) {
    if (defenseLines.length >= 1) break;

    const line: Player[] = [];
    for (const teamReq of combo.teams) {
      const player = sortedDefensemen.find(p =>
        !usedPlayers.has(p.id) &&
        (p.team === teamReq || p.nationality === teamReq)
      );
      if (player) {
        line.push(player);
      }
    }

    if (line.length === 2) {
      defenseLines.push({
        players: line,
        combination: combo,
        totalOVR: line.reduce((sum, p) => sum + parseInt(p.overall), 0),
        totalSalary: line.reduce((sum, p) => sum + (p.salary || 0), 0)
      });
      line.forEach(p => usedPlayers.add(p.id));
      activeCombinations.push(combo);
    }
  }

  // Fill remaining defense lines
  while (defenseLines.length < 3) {
    const availableDefensemen = sortedDefensemen.filter(p => !usedPlayers.has(p.id));
    const line = availableDefensemen.slice(0, 2);

    if (line.length < 2) break;

    // Check for matching combination
    let matchingCombo = null;
    for (const combo of defenseCombos) {
      if (activeCombinations.includes(combo)) continue;

      const teamMatches = combo.teams.every((teamReq, i) =>
        line[i] && (line[i].team === teamReq || line[i].nationality === teamReq)
      );

      if (teamMatches) {
        matchingCombo = combo;
        activeCombinations.push(combo);
        break;
      }
    }

    defenseLines.push({
      players: line,
      combination: matchingCombo,
      totalOVR: line.reduce((sum, p) => sum + parseInt(p.overall), 0),
      totalSalary: line.reduce((sum, p) => sum + (p.salary || 0), 0)
    });

    line.forEach(p => usedPlayers.add(p.id));
  }

  // Select 2 best goalies
  const selectedGoalies = sortedGoalies.slice(0, 2);

  // Calculate totals
  const totalSalary =
    forwardLines.reduce((sum, line) => sum + line.totalSalary, 0) +
    defenseLines.reduce((sum, line) => sum + line.totalSalary, 0) +
    selectedGoalies.reduce((sum, g) => sum + (g.salary || 0), 0);

  const totalOVR =
    forwardLines.reduce((sum, line) => sum + line.totalOVR, 0) +
    defenseLines.reduce((sum, line) => sum + line.totalOVR, 0) +
    selectedGoalies.reduce((sum, g) => sum + parseInt(g.overall), 0);

  return {
    forwardLines,
    defenseLines,
    goalies: selectedGoalies,
    totalSalary,
    totalOVR,
    activeCombinations
  };
};