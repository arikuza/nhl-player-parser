const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

class NHLParser {
  constructor() {
    this.baseUrl = 'https://www.nhlhutbuilder.com/php/player_stats.php';
    this.batchSize = 100;
  }

  async fetchPlayersData(start, length) {
    const formData = new URLSearchParams();
    formData.append('draw', '1');
    formData.append('start', start.toString());
    formData.append('length', length.toString());
    // Request card_art column
    formData.append('columns[0][data]', 'card_art');
    formData.append('columns[0][searchable]', 'false');
    formData.append('columns[0][orderable]', 'false');

    try {
      const response = await axios.post(this.baseUrl, formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        },
        timeout: 30000
      });

      return response.data;
    } catch (error) {
      console.error(`Error fetching data: ${error.message}`);
      throw error;
    }
  }

  async fetchGoaliesData(start, length) {
    const formData = new URLSearchParams();
    formData.append('draw', '1');
    formData.append('start', start.toString());
    formData.append('length', length.toString());
    // Request card_art column
    formData.append('columns[0][data]', 'card_art');
    formData.append('columns[0][searchable]', 'false');
    formData.append('columns[0][orderable]', 'false');

    try {
      const response = await axios.post('https://www.nhlhutbuilder.com/php/goalie_stats.php', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        },
        timeout: 30000
      });

      return response.data;
    } catch (error) {
      console.error(`Error fetching goalie data: ${error.message}`);
      throw error;
    }
  }

  cleanPlayerData(rawPlayer) {
    // Extract ID from the HTML link
    const idMatch = rawPlayer.full_name.match(/id="(\d+)"/);
    const id = idMatch ? idMatch[1] : 'unknown';

    // Clean player name from HTML tags
    const nameMatch = rawPlayer.full_name.match(/>([^<]+)</);
    const full_name = nameMatch ? nameMatch[1] : rawPlayer.full_name;

    // Clean weight (remove HTML tags)
    const weight = rawPlayer.weight ? rawPlayer.weight.replace(/<[^>]+>/g, '') : '';

    // Extract card image URL from card_art field
    let cardImage = null;
    if (rawPlayer.card_art) {
      const imgMatch = rawPlayer.card_art.match(/src="([^"]+)"/);
      if (imgMatch) {
        cardImage = `https://www.nhlhutbuilder.com/${imgMatch[1]}`;
      }
    }

    return {
      id,
      full_name,
      cardImage,
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

  cleanGoalieData(rawGoalie) {
    // Extract ID from the HTML link
    const idMatch = rawGoalie.full_name.match(/id="(\d+)"/);
    // Add 'G' prefix to goalie IDs to ensure uniqueness
    const id = idMatch ? `G${idMatch[1]}` : 'unknown';

    // Clean goalie name from HTML tags
    const nameMatch = rawGoalie.full_name.match(/>([^<]+)</);
    const full_name = nameMatch ? nameMatch[1] : rawGoalie.full_name;

    // Clean weight (remove HTML tags)
    const weight = rawGoalie.weight ? rawGoalie.weight.replace(/<[^>]+>/g, '') : '';

    // Extract card image URL from card_art field
    let cardImage = null;
    if (rawGoalie.card_art) {
      const imgMatch = rawGoalie.card_art.match(/src="([^"]+)"/);
      if (imgMatch) {
        cardImage = `https://www.nhlhutbuilder.com/${imgMatch[1]}`;
      }
    }

    return {
      id,
      full_name,
      cardImage,
      position: 'G',
      team: rawGoalie.team,
      nationality: rawGoalie.nationality,
      league: rawGoalie.league,
      hand: rawGoalie.hand,
      height: rawGoalie.height,
      weight,
      card: rawGoalie.card,
      overall: rawGoalie.overall,
      aOVR: rawGoalie.aOVR,
      // All goalie-specific stats
      glove_high: rawGoalie.glove_high,
      glove_low: rawGoalie.glove_low,
      stick_high: rawGoalie.stick_high,
      stick_low: rawGoalie.stick_low,
      five_hole: rawGoalie.five_hole,
      breakaway: rawGoalie.breakaway,
      quickness: rawGoalie.quickness,
      positioning: rawGoalie.positioning,
      passing: rawGoalie.passing,
      poke_check: rawGoalie.poke_check,
      shot_recovery: rawGoalie.shot_recovery,
      puck_control: rawGoalie.puck_control,
      rebound_control: rawGoalie.rebound_control,
      endurance: rawGoalie.endurance,
      agility: rawGoalie.agility,
      balance: rawGoalie.balance,
      speed: rawGoalie.speed,
      vision: rawGoalie.vision,
      hand_eye: rawGoalie.hand_eye,
      aggression: rawGoalie.aggression,
      date_added: rawGoalie.date_added,
      date_updated: rawGoalie.date_updated
    };
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async parseAllPlayers() {
    console.log('Starting NHL player data parsing...');
    const allPlayers = [];
    let start = 0;
    let hasMoreData = true;

    try {
      // First request to get total count
      console.log('Fetching initial data to determine total records...');
      const initialResponse = await this.fetchPlayersData(0, 1);
      const totalRecords = initialResponse.recordsTotal;
      console.log(`Found ${totalRecords} total players. Starting extraction...`);

      while (hasMoreData) {
        try {
          const response = await this.fetchPlayersData(start, this.batchSize);

          if (response.data && response.data.length > 0) {
            const cleanedPlayers = response.data.map(player => this.cleanPlayerData(player));
            allPlayers.push(...cleanedPlayers);

            console.log(`Extracted ${allPlayers.length} of ${totalRecords} players...`);

            start += this.batchSize;

            // Add a small delay to be respectful to the server
            await this.delay(500);
          } else {
            hasMoreData = false;
          }

          if (start >= totalRecords) {
            hasMoreData = false;
          }
        } catch (error) {
          console.error(`Error fetching players starting at ${start}:`, error.message);
          // Try to continue with next batch
          start += this.batchSize;
          await this.delay(2000); // Longer delay after error
        }
      }

      console.log(`Completed! Extracted ${allPlayers.length} players.`);
      return allPlayers;
    } catch (error) {
      console.error('Fatal error during parsing:', error.message);
      throw error;
    }
  }

  async parseAllGoalies() {
    console.log('Starting NHL goalie data parsing...');
    const allGoalies = [];
    let start = 0;
    let hasMoreData = true;

    try {
      // First request to get total count
      console.log('Fetching initial goalie data to determine total records...');
      const initialResponse = await this.fetchGoaliesData(0, 1);
      const totalRecords = initialResponse.recordsTotal;
      console.log(`Found ${totalRecords} total goalies. Starting extraction...`);

      while (hasMoreData) {
        try {
          const response = await this.fetchGoaliesData(start, this.batchSize);

          if (response.data && response.data.length > 0) {
            const cleanedGoalies = response.data.map(goalie => this.cleanGoalieData(goalie));
            allGoalies.push(...cleanedGoalies);

            console.log(`Extracted ${allGoalies.length} of ${totalRecords} goalies...`);

            start += this.batchSize;

            // Add a small delay to be respectful to the server
            await this.delay(500);
          } else {
            hasMoreData = false;
          }

          if (start >= totalRecords) {
            hasMoreData = false;
          }
        } catch (error) {
          console.error(`Error fetching goalies starting at ${start}:`, error.message);
          // Try to continue with next batch
          start += this.batchSize;
          await this.delay(2000); // Longer delay after error
        }
      }

      console.log(`Completed! Extracted ${allGoalies.length} goalies.`);
      return allGoalies;
    } catch (error) {
      console.error('Fatal error during goalie parsing:', error.message);
      throw error;
    }
  }

  categorizePlayersByPosition(players) {
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

  async saveToFile(data, filename) {
    const dataDir = path.join(__dirname, 'public', 'data');

    // Create data directory if it doesn't exist
    try {
      await fs.mkdir(dataDir, { recursive: true });
    } catch (error) {
      console.error('Error creating data directory:', error.message);
    }

    const filepath = path.join(dataDir, filename);
    await fs.writeFile(filepath, JSON.stringify(data, null, 2));
    console.log(`Data saved to ${filepath}`);
  }

  async run() {
    try {
      // Parse all players
      const allPlayers = await this.parseAllPlayers();

      // Parse all goalies
      const allGoalies = await this.parseAllGoalies();

      // Combine all players and goalies
      const allPlayersComplete = [...allPlayers, ...allGoalies];

      // Save all players
      await this.saveToFile(allPlayersComplete, 'all_players.json');

      // Categorize players
      const categorized = this.categorizePlayersByPosition(allPlayersComplete);

      // Save categorized data
      await this.saveToFile(categorized.forwards, 'forwards.json');
      await this.saveToFile(categorized.defensemen, 'defensemen.json');
      await this.saveToFile(categorized.goalies, 'goalies.json');

      // Save summary
      const summary = {
        total: allPlayersComplete.length,
        forwards: categorized.forwards.length,
        defensemen: categorized.defensemen.length,
        goalies: categorized.goalies.length,
        lastUpdated: new Date().toISOString()
      };
      await this.saveToFile(summary, 'summary.json');

      console.log('\n=== Parsing Complete ===');
      console.log(`Total players: ${allPlayersComplete.length}`);
      console.log(`Forwards: ${categorized.forwards.length}`);
      console.log(`Defensemen: ${categorized.defensemen.length}`);
      console.log(`Goalies: ${categorized.goalies.length}`);

    } catch (error) {
      console.error('Error during parsing:', error);
      process.exit(1);
    }
  }
}

// Run the parser
const parser = new NHLParser();
parser.run();