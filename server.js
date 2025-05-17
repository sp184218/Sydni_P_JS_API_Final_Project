import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors'; // Use CORS to handle cross-origin requests

const app = express();
const port = 3000;

app.use(express.static('public')); // Serve static files from the 'public' directory
app.use(cors()); // Enable CORS for cross-origin requests

// Example API route to fetch character links
app.get('/api/scrape/characters', async (req, res) => {
  try {
    const scrapeRes = await fetch('https://finalkillerinstinctapi.onrender.com/api/scrape/characters');
    
    if (!scrapeRes.ok) {
      throw new Error(`Failed to fetch characters: ${scrapeRes.status}`);
    }

    const scrapeData = await scrapeRes.json();

    // You can process or filter the links as needed, here we're sending them as is
    res.json(scrapeData.links); // Send back the list of character links
  } catch (error) {
    console.error("Error fetching characters:", error);
    res.status(500).json({ message: 'Error fetching characters.' });
  }
});

// Example API route to fetch infiltration links
app.get('/api/scrape/infil', async (req, res) => {
  try {
    const infilRes = await fetch('https://finalkillerinstinctapi.onrender.com/api/scrape/infil');
    
    if (!infilRes.ok) {
      throw new Error(`Failed to fetch infiltrators: ${infilRes.status}`);
    }

    const infilData = await infilRes.json();

    // Send back the list of infiltration links
    res.json(infilData.links);
  } catch (error) {
    console.error("Error fetching infil data:", error);
    res.status(500).json({ message: 'Error fetching infil data.' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
