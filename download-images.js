const axios = require('axios');
const fs = require('fs');
const path = require('path');

async function downloadImage(url, filepath) {
  try {
    const response = await axios({
      method: 'GET',
      url: url,
      responseType: 'stream'
    });

    return new Promise((resolve, reject) => {
      const writer = fs.createWriteStream(filepath);
      response.data.pipe(writer);
      writer.on('finish', resolve);
      writer.on('error', reject);
    });
  } catch (error) {
    console.error(`Failed to download ${url}:`, error.message);
    throw error;
  }
}

async function downloadAllCardImages() {
  // Create directories for images
  const imageDir = path.join(__dirname, 'public', 'images', 'cards');

  // Create directory if it doesn't exist
  if (!fs.existsSync(imageDir)) {
    fs.mkdirSync(imageDir, { recursive: true });
  }

  // Load all players data
  const playersData = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'public', 'data', 'all_players.json'), 'utf8')
  );

  console.log(`Found ${playersData.length} players`);

  let downloaded = 0;
  let failed = 0;
  let skipped = 0;

  for (let i = 0; i < playersData.length; i++) {
    const player = playersData[i];

    if (!player.cardImage) {
      skipped++;
      continue;
    }

    // Extract filename from URL
    const urlParts = player.cardImage.split('/');
    const filename = urlParts[urlParts.length - 1];
    const localPath = path.join(imageDir, filename);

    // Skip if already downloaded
    if (fs.existsSync(localPath)) {
      console.log(`[${i + 1}/${playersData.length}] Skipping ${player.full_name} - already exists`);
      skipped++;
      continue;
    }

    try {
      console.log(`[${i + 1}/${playersData.length}] Downloading ${player.full_name}...`);
      await downloadImage(player.cardImage, localPath);
      downloaded++;

      // Add delay to be respectful to the server
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error(`Failed to download image for ${player.full_name}`);
      failed++;
    }

    // Progress update every 10 images
    if ((downloaded + failed) % 10 === 0) {
      console.log(`Progress: Downloaded ${downloaded}, Failed ${failed}, Skipped ${skipped}`);
    }
  }

  console.log('\n=== Download Complete ===');
  console.log(`Downloaded: ${downloaded}`);
  console.log(`Failed: ${failed}`);
  console.log(`Skipped: ${skipped}`);
  console.log(`Total: ${playersData.length}`);

  // Now update the JSON files to use local paths
  console.log('\nUpdating data files to use local images...');

  const updatedPlayers = playersData.map(player => {
    if (player.cardImage) {
      const urlParts = player.cardImage.split('/');
      const filename = urlParts[urlParts.length - 1];
      const localPath = path.join(imageDir, filename);

      // If the image was successfully downloaded, update the path
      if (fs.existsSync(localPath)) {
        return {
          ...player,
          cardImage: `/images/cards/${filename}`
        };
      }
    }
    return player;
  });

  // Save updated data
  fs.writeFileSync(
    path.join(__dirname, 'public', 'data', 'all_players.json'),
    JSON.stringify(updatedPlayers, null, 2)
  );

  // Update categorized files
  const forwards = updatedPlayers.filter(p => ['C', 'LW', 'RW'].includes(p.position));
  const defensemen = updatedPlayers.filter(p => ['LD', 'RD', 'D'].includes(p.position));
  const goalies = updatedPlayers.filter(p => p.position === 'G');

  fs.writeFileSync(
    path.join(__dirname, 'public', 'data', 'forwards.json'),
    JSON.stringify(forwards, null, 2)
  );

  fs.writeFileSync(
    path.join(__dirname, 'public', 'data', 'defensemen.json'),
    JSON.stringify(defensemen, null, 2)
  );

  fs.writeFileSync(
    path.join(__dirname, 'public', 'data', 'goalies.json'),
    JSON.stringify(goalies, null, 2)
  );

  console.log('Data files updated with local image paths!');
}

// Run the downloader
downloadAllCardImages().catch(console.error);