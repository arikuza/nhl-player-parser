import axios from 'axios';

export interface PlayerStats {
  id: string;
  full_name: string;
  position: string;
  team: string;
  nationality: string;
  league: string;
  hand: string;
  height: string;
  weight: string;
  card: string;
  overall: string;
  aOVR: string;
  // Skating stats
  acceleration: string;
  agility: string;
  balance: string;
  endurance: string;
  speed: string;
  // Shooting stats
  slap_shot_accuracy: string;
  slap_shot_power: string;
  wrist_shot_accuracy: string;
  wrist_shot_power: string;
  // Hands stats
  deking: string;
  off_awareness: string;
  hand_eye: string;
  passing: string;
  puck_control: string;
  // Defense stats
  body_checking: string;
  strength: string;
  aggression: string;
  durability: string;
  fighting_skill: string;
  def_awareness: string;
  shot_blocking: string;
  stick_checking: string;
  faceoffs: string;
  discipline: string;
  date_added: string;
  date_updated: string;
}

export interface ScrapingProgress {
  current: number;
  total: number;
  status: string;
}

export class NHLScraper {
  private baseUrl = '/php/player_stats.php';
  private batchSize = 100;

  async getAllPlayers(progressCallback?: (progress: ScrapingProgress) => void): Promise<PlayerStats[]> {
    const allPlayers: PlayerStats[] = [];
    let start = 0;
    let hasMoreData = true;

    // First request to get total count
    const initialResponse = await this.fetchPlayersData(0, 1);
    const totalRecords = initialResponse.recordsTotal;

    progressCallback?.({
      current: 0,
      total: totalRecords,
      status: `Found ${totalRecords} total players. Starting extraction...`
    });

    while (hasMoreData) {
      try {
        const response = await this.fetchPlayersData(start, this.batchSize);
        
        if (response.data && response.data.length > 0) {
          const cleanedPlayers = response.data.map(this.cleanPlayerData);
          allPlayers.push(...cleanedPlayers);
          
          start += this.batchSize;
          
          progressCallback?.({
            current: allPlayers.length,
            total: totalRecords,
            status: `Extracted ${allPlayers.length} of ${totalRecords} players...`
          });
          
          // Add a small delay to be respectful to the server
          await this.delay(100);
        } else {
          hasMoreData = false;
        }
        
        if (start >= totalRecords) {
          hasMoreData = false;
        }
      } catch (error) {
        console.error(`Error fetching players starting at ${start}:`, error);
        throw new Error(`Failed to fetch player data: ${error}`);
      }
    }

    progressCallback?.({
      current: allPlayers.length,
      total: totalRecords,
      status: `Completed! Extracted ${allPlayers.length} players.`
    });

    return allPlayers;
  }

  private async fetchPlayersData(start: number, length: number) {
    const formData = new URLSearchParams();
    formData.append('draw', '1');
    formData.append('start', start.toString());
    formData.append('length', length.toString());
    formData.append('order[0][column]', '12');
    formData.append('order[0][dir]', 'desc');

    const response = await axios.post(this.baseUrl, formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    return response.data;
  }

  private cleanPlayerData(rawPlayer: any): PlayerStats {
    // Extract ID from the HTML link
    const idMatch = rawPlayer.full_name.match(/id="(\d+)"/); 
    const id = idMatch ? idMatch[1] : 'unknown';
    
    // Clean player name from HTML tags
    const nameMatch = rawPlayer.full_name.match(/>([^<]+)</); 
    const full_name = nameMatch ? nameMatch[1] : rawPlayer.full_name;
    
    // Clean weight (remove HTML tags)
    const weight = rawPlayer.weight.replace(/<[^>]+>/g, '');

    return {
      id,
      full_name,
      position: rawPlayer.position,
      team: rawPlayer.team,
      nationality: rawPlayer.nationality,
      league: rawPlayer.league,
      hand: rawPlayer.hand,
      height: rawPlayer.height,
      weight,
      card: rawPlayer.card,
      overall: rawPlayer.overall,
      aOVR: rawPlayer.aOVR,
      acceleration: rawPlayer.acceleration,
      agility: rawPlayer.agility,
      balance: rawPlayer.balance,
      endurance: rawPlayer.endurance,
      speed: rawPlayer.speed,
      slap_shot_accuracy: rawPlayer.slap_shot_accuracy,
      slap_shot_power: rawPlayer.slap_shot_power,
      wrist_shot_accuracy: rawPlayer.wrist_shot_accuracy,
      wrist_shot_power: rawPlayer.wrist_shot_power,
      deking: rawPlayer.deking,
      off_awareness: rawPlayer.off_awareness,
      hand_eye: rawPlayer.hand_eye,
      passing: rawPlayer.passing,
      puck_control: rawPlayer.puck_control,
      body_checking: rawPlayer.body_checking,
      strength: rawPlayer.strength,
      aggression: rawPlayer.aggression,
      durability: rawPlayer.durability,
      fighting_skill: rawPlayer.fighting_skill,
      def_awareness: rawPlayer.def_awareness,
      shot_blocking: rawPlayer.shot_blocking,
      stick_checking: rawPlayer.stick_checking,
      faceoffs: rawPlayer.faceoffs,
      discipline: rawPlayer.discipline,
      date_added: rawPlayer.date_added,
      date_updated: rawPlayer.date_updated
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  categorizePlayersByPosition(players: PlayerStats[]): {
    forwards: PlayerStats[];
    defensemen: PlayerStats[];
    goalies: PlayerStats[];
  } {
    const forwards = players.filter(player => 
      ['C', 'LW', 'RW'].includes(player.position)
    );
    
    const defensemen = players.filter(player => 
      ['LD', 'RD', 'D'].includes(player.position)
    );
    
    const goalies = players.filter(player => 
      ['G', 'GK'].includes(player.position)
    );

    return { forwards, defensemen, goalies };
  }

  exportToJSON(data: any, filename: string): void {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
