interface PlayerStats {
  position: string;
  [key: string]: any;
}

// Calculate percentile rank for a value in an array
function getPercentileRank(value: number, sortedArray: number[]): number {
  if (sortedArray.length === 0) return 50;

  const index = sortedArray.findIndex(v => v >= value);
  if (index === -1) return 100; // Value is higher than all
  if (index === 0) return 0; // Value is lower than all

  return (index / sortedArray.length) * 100;
}

// Get all stat values for a specific stat and position group
function getStatValues(players: PlayerStats[], statName: string, positionGroup: string[]): number[] {
  return players
    .filter(p => positionGroup.includes(p.position))
    .map(p => parseInt(p[statName]) || 0)
    .filter(v => v > 0)
    .sort((a, b) => a - b);
}

// Position groups
const FORWARD_POSITIONS = ['C', 'LW', 'RW'];
const DEFENSE_POSITIONS = ['LD', 'RD', 'D'];
const GOALIE_POSITIONS = ['G'];

// Skater stats to track
const SKATER_STATS = [
  'acceleration', 'agility', 'balance', 'endurance', 'speed',
  'slap_shot_accuracy', 'slap_shot_power', 'wrist_shot_accuracy', 'wrist_shot_power',
  'deking', 'hand_eye', 'passing', 'puck_control', 'off_awareness',
  'def_awareness', 'body_checking', 'strength', 'aggression',
  'durability', 'fighting_skill', 'shot_blocking', 'stick_checking',
  'faceoffs', 'discipline'
];

// Goalie stats to track
const GOALIE_STATS = [
  'high_shots', 'low_shots', 'quickness', 'positioning',
  'poke_check', 'shot_recovery', 'rebound_control', 'vision',
  'agility', 'speed', 'endurance', 'balance', 'hand_eye',
  'puck_control', 'passing', 'aggression'
];

export class StatPercentileCalculator {
  private percentileCache: Map<string, number[]> = new Map();
  private players: PlayerStats[] = [];

  constructor(players: PlayerStats[]) {
    this.players = players;
    this.calculatePercentiles();
  }

  private calculatePercentiles() {
    // Calculate for forwards
    SKATER_STATS.forEach(stat => {
      const key = `forward_${stat}`;
      const values = getStatValues(this.players, stat, FORWARD_POSITIONS);
      this.percentileCache.set(key, values);
    });

    // Calculate for defensemen
    SKATER_STATS.forEach(stat => {
      const key = `defense_${stat}`;
      const values = getStatValues(this.players, stat, DEFENSE_POSITIONS);
      this.percentileCache.set(key, values);
    });

    // Calculate for goalies
    GOALIE_STATS.forEach(stat => {
      const key = `goalie_${stat}`;
      const values = getStatValues(this.players, stat, GOALIE_POSITIONS);
      this.percentileCache.set(key, values);
    });
  }

  getStatPercentile(position: string, statName: string, value: number): number {
    let positionGroup = 'forward';
    if (DEFENSE_POSITIONS.includes(position)) {
      positionGroup = 'defense';
    } else if (GOALIE_POSITIONS.includes(position)) {
      positionGroup = 'goalie';
    }

    const key = `${positionGroup}_${statName}`;
    const values = this.percentileCache.get(key);

    if (!values || values.length === 0) return 50;

    return getPercentileRank(value, values);
  }

  getStatColor(position: string, statName: string, value: number): string {
    const percentile = this.getStatPercentile(position, statName, value);

    // Elite: top 10%
    if (percentile >= 90) return '#00E676'; // Bright green

    // Above average: top 30%
    if (percentile >= 70) return '#4CAF50'; // Green

    // Average: middle 40%
    if (percentile >= 30) return '#FFC107'; // Amber

    // Below average: bottom 30%
    return '#FF6B6B'; // Red
  }

  getStatTier(position: string, statName: string, value: number): string {
    const percentile = this.getStatPercentile(position, statName, value);

    if (percentile >= 90) return 'elite';
    if (percentile >= 70) return 'above';
    if (percentile >= 30) return 'average';
    return 'below';
  }

  getStatDescription(position: string, statName: string, value: number): string {
    const percentile = Math.round(this.getStatPercentile(position, statName, value));
    const tier = this.getStatTier(position, statName, value);

    const tierText = {
      elite: 'Elite',
      above: 'Above Average',
      average: 'Average',
      below: 'Below Average'
    }[tier];

    return `${tierText} (${percentile}th percentile)`;
  }
}

export default StatPercentileCalculator;