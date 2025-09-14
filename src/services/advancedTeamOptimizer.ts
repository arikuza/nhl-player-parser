import { lineCombinations } from '../data/lineCombinations';

export interface Player {
  id: string;
  full_name: string;
  position: string;
  team: string;
  nationality: string;
  overall: string;
  card: string;
  salary?: number;
}

export interface LineCombination {
  id: string;
  type: 'forward' | 'defense';
  boost: string;
  teams: string[];
  status?: string;
}

export interface OptimizedLine {
  players: Player[];
  combinations: LineCombination[];
  totalOVR: number;
  baseTotalOVR: number;
  ovrBonus: number;
  apBonus: number;
  salaryBonus: number;
  totalSalary: number;
}

export interface OptimizedTeam {
  forwardLines: OptimizedLine[];
  defenseLines: OptimizedLine[];
  goalies: Player[];
  totalSalary: number;
  totalOVR: number;
  totalOvrBonus: number;
  totalApBonus: number;
  totalSalaryBonus: number;
}

// Parse bonus value from string
const parseBonus = (boost: string): { type: string; value: number } => {
  if (boost.includes('OVR')) {
    return { type: 'OVR', value: parseInt(boost) };
  }
  if (boost.includes('AP')) {
    return { type: 'AP', value: parseInt(boost) };
  }
  if (boost.includes('SAL')) {
    const match = boost.match(/([0-9.]+)M/);
    return { type: 'SAL', value: match ? parseFloat(match[1]) * 1000000 : 0 };
  }
  return { type: 'UNKNOWN', value: 0 };
};

// Check if player matches team requirement
const playerMatchesTeam = (player: Player, teamReq: string): boolean => {
  return player.team === teamReq || player.nationality === teamReq;
};

// Check if a line matches a combination
const lineMatchesCombination = (players: Player[], combo: LineCombination): boolean => {
  if (combo.type === 'forward' && players.length !== 3) return false;
  if (combo.type === 'defense' && players.length !== 2) return false;

  // Check all permutations of players to match team requirements
  const permutations = getPermutations(players);

  for (const perm of permutations) {
    let matches = true;
    for (let i = 0; i < combo.teams.length; i++) {
      if (!playerMatchesTeam(perm[i], combo.teams[i])) {
        matches = false;
        break;
      }
    }
    if (matches) return true;
  }

  return false;
};

// Get all permutations of an array
function getPermutations<T>(arr: T[]): T[][] {
  if (arr.length <= 1) return [arr];
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i++) {
    const current = arr[i];
    const remaining = [...arr.slice(0, i), ...arr.slice(i + 1)];
    const perms = getPermutations(remaining);
    for (const perm of perms) {
      result.push([current, ...perm]);
    }
  }
  return result;
}

// Find all matching combinations for a line
const findMatchingCombinations = (
  players: Player[],
  type: 'forward' | 'defense'
): LineCombination[] => {
  const matching: LineCombination[] = [];
  const typeCombos = lineCombinations.filter(c => c.type === type);

  for (const combo of typeCombos) {
    if (lineMatchesCombination(players, combo)) {
      matching.push(combo);
    }
  }

  return matching;
};

// Calculate total bonuses for a line
const calculateLineBonuses = (combinations: LineCombination[]) => {
  let ovrBonus = 0;
  let apBonus = 0;
  let salaryBonus = 0;

  for (const combo of combinations) {
    const bonus = parseBonus(combo.boost);
    switch (bonus.type) {
      case 'OVR':
        ovrBonus += bonus.value;
        break;
      case 'AP':
        apBonus += bonus.value;
        break;
      case 'SAL':
        salaryBonus += bonus.value;
        break;
    }
  }

  return { ovrBonus, apBonus, salaryBonus };
};

// Estimate salary based on OVR
const estimateSalary = (overall: number): number => {
  if (overall >= 90) return 10000000 + (overall - 90) * 500000;
  if (overall >= 85) return 5000000 + (overall - 85) * 800000;
  if (overall >= 80) return 2000000 + (overall - 80) * 400000;
  return 750000 + (overall - 70) * 125000;
};

// Normalize player name for comparison (remove special characters, lowercase)
const normalizeName = (name: string): string => {
  return name.toLowerCase().replace(/[^a-z]/g, '');
};

// Check if two players are the same person
const isSamePlayer = (p1: Player, p2: Player): boolean => {
  const name1 = normalizeName(p1.full_name);
  const name2 = normalizeName(p2.full_name);
  return name1 === name2;
};

// Generate all possible line combinations
function* generateLineCombinations(
  players: Player[],
  lineSize: number,
  usedPlayerNames: Set<string>
): Generator<Player[]> {
  const availablePlayers = players.filter(p =>
    !usedPlayerNames.has(normalizeName(p.full_name))
  );

  if (lineSize === 2) {
    // Defense pairs
    for (let i = 0; i < availablePlayers.length - 1; i++) {
      for (let j = i + 1; j < availablePlayers.length; j++) {
        const p1 = availablePlayers[i];
        const p2 = availablePlayers[j];
        if (!isSamePlayer(p1, p2)) {
          yield [p1, p2];
        }
      }
    }
  } else if (lineSize === 3) {
    // Forward lines
    for (let i = 0; i < availablePlayers.length - 2; i++) {
      for (let j = i + 1; j < availablePlayers.length - 1; j++) {
        for (let k = j + 1; k < availablePlayers.length; k++) {
          const p1 = availablePlayers[i];
          const p2 = availablePlayers[j];
          const p3 = availablePlayers[k];
          if (!isSamePlayer(p1, p2) && !isSamePlayer(p1, p3) && !isSamePlayer(p2, p3)) {
            yield [p1, p2, p3];
          }
        }
      }
    }
  }
}

// Score a line based on OVR and bonuses
const scoreLine = (line: OptimizedLine, lineNumber: number): number => {
  // Priority for first two lines: OVR bonuses
  // Priority for other lines: AP bonuses, then salary
  const positionMultiplier = lineNumber <= 2 ? 2 : 1;

  return (
    line.baseTotalOVR * 10 + // Base OVR is always important
    line.ovrBonus * 1000 * positionMultiplier + // OVR bonus heavily weighted for top lines
    line.apBonus * 100 * (3 - positionMultiplier) + // AP bonus for lower lines
    (line.salaryBonus / 1000000) * 10 // Salary bonus as tie-breaker
  );
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

  // Sort by OVR for initial selection
  const sortedForwards = [...forwardsWithSalary].sort((a, b) =>
    parseInt(b.overall) - parseInt(a.overall)
  );

  const sortedDefensemen = [...defensemenWithSalary].sort((a, b) =>
    parseInt(b.overall) - parseInt(a.overall)
  );

  const usedPlayerNames = new Set<string>();
  const forwardLines: OptimizedLine[] = [];
  const defenseLines: OptimizedLine[] = [];

  // Build forward lines (need 4)
  for (let lineNum = 1; lineNum <= 4; lineNum++) {
    let bestLine: OptimizedLine | null = null;
    let bestScore = -1;
    let count = 0;
    const maxAttempts = lineNum <= 2 ? 200 : 100; // More attempts for top lines

    for (const players of generateLineCombinations(sortedForwards, 3, usedPlayerNames)) {
      if (count++ > maxAttempts) break;

      const combinations = findMatchingCombinations(players, 'forward');
      const bonuses = calculateLineBonuses(combinations);
      const baseTotalOVR = players.reduce((sum: number, p: Player) => sum + parseInt(p.overall), 0);

      const line: OptimizedLine = {
        players,
        combinations,
        baseTotalOVR,
        totalOVR: baseTotalOVR + bonuses.ovrBonus,
        ovrBonus: bonuses.ovrBonus,
        apBonus: bonuses.apBonus,
        salaryBonus: bonuses.salaryBonus,
        totalSalary: players.reduce((sum: number, p: Player) => sum + (p.salary || 0), 0) - bonuses.salaryBonus
      };

      const score = scoreLine(line, lineNum);
      if (score > bestScore) {
        bestScore = score;
        bestLine = line;
      }
    }

    if (bestLine) {
      forwardLines.push(bestLine);
      bestLine.players.forEach(p => usedPlayerNames.add(normalizeName(p.full_name)));
    }
  }

  // Build defense lines (need 3)
  for (let lineNum = 1; lineNum <= 3; lineNum++) {
    let bestLine: OptimizedLine | null = null;
    let bestScore = -1;
    let count = 0;
    const maxAttempts = lineNum === 1 ? 100 : 50;

    for (const players of generateLineCombinations(sortedDefensemen, 2, usedPlayerNames)) {
      if (count++ > maxAttempts) break;

      const combinations = findMatchingCombinations(players, 'defense');
      const bonuses = calculateLineBonuses(combinations);
      const baseTotalOVR = players.reduce((sum: number, p: Player) => sum + parseInt(p.overall), 0);

      const line: OptimizedLine = {
        players,
        combinations,
        baseTotalOVR,
        totalOVR: baseTotalOVR + bonuses.ovrBonus,
        ovrBonus: bonuses.ovrBonus,
        apBonus: bonuses.apBonus,
        salaryBonus: bonuses.salaryBonus,
        totalSalary: players.reduce((sum: number, p: Player) => sum + (p.salary || 0), 0) - bonuses.salaryBonus
      };

      const score = scoreLine(line, lineNum);
      if (score > bestScore) {
        bestScore = score;
        bestLine = line;
      }
    }

    if (bestLine) {
      defenseLines.push(bestLine);
      bestLine.players.forEach(p => usedPlayerNames.add(normalizeName(p.full_name)));
    }
  }

  // Select goalies (2 best available)
  const availableGoalies = goaliesWithSalary.filter(g =>
    !usedPlayerNames.has(normalizeName(g.full_name))
  );
  const selectedGoalies = availableGoalies.slice(0, 2);

  // Calculate totals
  const totalSalary =
    forwardLines.reduce((sum, line) => sum + line.totalSalary, 0) +
    defenseLines.reduce((sum, line) => sum + line.totalSalary, 0) +
    selectedGoalies.reduce((sum, g) => sum + (g.salary || 0), 0);

  const totalOVR =
    forwardLines.reduce((sum, line) => sum + line.totalOVR, 0) +
    defenseLines.reduce((sum, line) => sum + line.totalOVR, 0) +
    selectedGoalies.reduce((sum, g) => sum + parseInt(g.overall), 0);

  const totalOvrBonus =
    forwardLines.reduce((sum, line) => sum + line.ovrBonus, 0) +
    defenseLines.reduce((sum, line) => sum + line.ovrBonus, 0);

  const totalApBonus =
    forwardLines.reduce((sum, line) => sum + line.apBonus, 0) +
    defenseLines.reduce((sum, line) => sum + line.apBonus, 0);

  const totalSalaryBonus =
    forwardLines.reduce((sum, line) => sum + line.salaryBonus, 0) +
    defenseLines.reduce((sum, line) => sum + line.salaryBonus, 0);

  return {
    forwardLines,
    defenseLines,
    goalies: selectedGoalies,
    totalSalary,
    totalOVR,
    totalOvrBonus,
    totalApBonus,
    totalSalaryBonus
  };
};