import { exec } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

// Get directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper function to run the Python scraper
function runScraper() {
  return new Promise((resolve, reject) => {
    const scraperPath = path.join(__dirname, '../server/scraper.py');
    exec(`python3 ${scraperPath}`, (error, stdout, stderr) => {
      if (error) {
        console.error(`Scraper error: ${error.message}`);
        return reject(error);
      }
      if (stderr) {
        console.error(`Scraper stderr: ${stderr}`);
      }
      resolve(stdout);
    });
  });
}

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      console.log('Starting API scrape...');
      const scrapedData = await runScraper();
      const parsedData = JSON.parse(scrapedData);
      
      res.status(200).json({
        message: 'Scraping completed successfully', 
        articlesCount: parsedData.length
      });
    } catch (error) {
      console.error(`Error during API scrape: ${error}`);
      res.status(500).json({ message: 'Error during scraping', error: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
