const axios = require('axios');
const fs = require('fs');
const path = require('path');

async function downloadImage(url, filepath) {
  try {
    const response = await axios({
      method: 'GET',
      url: url,
      responseType: 'stream',
      timeout: 5000
    });

    return new Promise((resolve, reject) => {
      const writer = fs.createWriteStream(filepath);
      response.data.pipe(writer);
      writer.on('finish', resolve);
      writer.on('error', reject);
    });
  } catch (error) {
    throw error;
  }
}

async function downloadBatch(batch) {
  const results = await Promise.allSettled(
    batch.map(async ({ player, localPath }) => {
      try {
        await downloadImage(player.cardImage, localPath);
        return { success: true, player: player.full_name };
      } catch (error) {
        return { success: false, player: player.full_name, error: error.message };
      }
    })
  );

  return results.map(r => r.value || r.reason);
}

async function downloadAllCardImagesFast() {
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

  // Prepare download queue
  const toDownload = [];
  let skipped = 0;

  for (const player of playersData) {
    if (!player.cardImage) {
      skipped++;
      continue;
    }

    const urlParts = player.cardImage.split('/');
    const filename = urlParts[urlParts.length - 1];
    const localPath = path.join(imageDir, filename);

    // Skip if already downloaded
    if (fs.existsSync(localPath)) {
      skipped++;
      continue;
    }

    toDownload.push({ player, localPath, filename });
  }

  console.log(`${toDownload.length} images to download, ${skipped} already exist`);

  // Download in batches of 10
  const batchSize = 10;
  let downloaded = 0;
  let failed = 0;

  for (let i = 0; i < toDownload.length; i += batchSize) {
    const batch = toDownload.slice(i, i + batchSize);
    console.log(`Downloading batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(toDownload.length / batchSize)}...`);

    const results = await downloadBatch(batch);

    results.forEach(result => {
      if (result.success) {
        downloaded++;
      } else {
        console.error(`Failed: ${result.player} - ${result.error}`);
        failed++;
      }
    });

    // Small delay between batches
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  console.log('\n=== Download Complete ===');
  console.log(`Downloaded: ${downloaded}`);
  console.log(`Failed: ${failed}`);
  console.log(`Already existed: ${skipped}`);
  console.log(`Total: ${playersData.length}`);

  // Update the JSON files to use local paths
  console.log('\nUpdating data files to use local images...');

  const updatedPlayers = playersData.map(player => {
    if (player.cardImage) {
      const urlParts = player.cardImage.split('/');
      const filename = urlParts[urlParts.length - 1];
      const localPath = path.join(imageDir, filename);

      // If the image exists locally, update the path
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
downloadAllCardImagesFast().catch(console.error);