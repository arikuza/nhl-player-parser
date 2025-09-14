const axios = require('axios');
const cheerio = require('cheerio');

class GoalieParser {
  constructor() {
    this.baseUrl = 'https://nhlhutbuilder.com/goalie-stats.php';
  }

  async fetchGoaliesHTML() {
    try {
      const response = await axios.get(this.baseUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching goalie page:', error.message);
      throw error;
    }
  }

  parseGoaliesFromHTML(html) {
    const $ = cheerio.load(html);
    const goalies = [];

    // Find the table with goalie data
    $('table#table-players tbody tr').each((index, row) => {
      try {
        const cells = $(row).find('td');
        if (cells.length < 10) return;

        // Extract goalie data from table cells
        const goalie = {
          id: `G${index + 1000}`, // Generate unique ID for goalies
          full_name: $(cells[0]).text().trim().toUpperCase(),
          position: 'G',
          team: $(cells[1]).text().trim() || 'N/A',
          nationality: $(cells[2]).text().trim() || 'N/A',
          league: 'NHL',
          hand: $(cells[3]).text().trim() || 'N/A',
          height: $(cells[4]).text().trim() || 'N/A',
          weight: $(cells[5]).text().trim() || 'N/A',
          card: $(cells[6]).text().trim() || 'BA',
          overall: $(cells[7]).text().trim() || '0',

          // Goalie-specific stats
          high_shots: $(cells[8]).text().trim() || '0',
          low_shots: $(cells[9]).text().trim() || '0',
          quickness: $(cells[10]).text().trim() || '0',
          positioning: $(cells[11]).text().trim() || '0',
          five_hole: $(cells[12]).text().trim() || '0',
          glove_high: $(cells[13]).text().trim() || '0',
          glove_low: $(cells[14]).text().trim() || '0',
          stick_high: $(cells[15]).text().trim() || '0',
          stick_low: $(cells[16]).text().trim() || '0',
          poke_check: $(cells[17]).text().trim() || '0',
          passing: $(cells[18]).text().trim() || '0',
          rebound_control: $(cells[19]).text().trim() || '0',
          recovery: $(cells[20]).text().trim() || '0',
          puck_playing: $(cells[21]).text().trim() || '0',

          // Add placeholders for player stats to maintain consistency
          acceleration: '0',
          agility: '0',
          balance: '0',
          endurance: '0',
          speed: '0',
          slap_shot_accuracy: '0',
          slap_shot_power: '0',
          wrist_shot_accuracy: '0',
          wrist_shot_power: '0',
          deking: '0',
          off_awareness: '0',
          hand_eye: '0',
          puck_control: '0',
          body_checking: '0',
          strength: '0',
          aggression: '0',
          durability: '0',
          fighting_skill: '0',
          def_awareness: '0',
          shot_blocking: '0',
          stick_checking: '0',
          faceoffs: '0',
          discipline: '0',

          date_added: new Date().toISOString().split('T')[0],
          date_updated: '0000-00-00'
        };

        // Skip if no name found
        if (goalie.full_name && goalie.full_name !== '') {
          goalies.push(goalie);
        }
      } catch (err) {
        console.error(`Error parsing goalie row ${index}:`, err.message);
      }
    });

    return goalies;
  }

  async parseGoalies() {
    try {
      console.log('Fetching goalie data from website...');
      const html = await this.fetchGoaliesHTML();

      console.log('Parsing goalie data from HTML...');
      const goalies = this.parseGoaliesFromHTML(html);

      console.log(`Found ${goalies.length} goalies`);
      return goalies;
    } catch (error) {
      console.error('Error parsing goalies:', error.message);
      return [];
    }
  }
}

module.exports = GoalieParser;