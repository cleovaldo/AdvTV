import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // Global state for screens (simulating a DB)
  const PLAYLISTS_FILE = path.join(process.cwd(), 'screen_playlists.json');
  let screenPlaylists: Record<string, any> = {};
  
  // Load playlists from file on startup
  try {
    if (fs.existsSync(PLAYLISTS_FILE)) {
      const data = fs.readFileSync(PLAYLISTS_FILE, 'utf8');
      screenPlaylists = JSON.parse(data);
      console.log('Loaded screen playlists from file');
    }
  } catch (err) {
    console.error('Error loading playlists file:', err);
  }

  const savePlaylists = () => {
    try {
      fs.writeFileSync(PLAYLISTS_FILE, JSON.stringify(screenPlaylists, null, 2));
    } catch (err) {
      console.error('Error saving playlists file:', err);
    }
  };

  let newsData: any[] = [];
  let holyricsData: any = {
    type: 'idle',
    title: '',
    artist: '',
    text: '',
    next_text: '',
    timestamp: 0
  };

  // Fetch news from CPAD News (WordPress API)
  const fetchCpadNews = async () => {
    try {
      console.log('Fetching news from CPAD News...');
      const response = await fetch('https://www.cpadnews.com.br/wp-json/wp/v2/posts?_embed&per_page=10');
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const posts: any = await response.json();
      
      const mappedNews = posts.map((post: any) => ({
        id: String(post.id),
        title: post.title.rendered.replace(/&#8211;/g, '-').replace(/&#8212;/g, '—').replace(/&nbsp;/g, ' '),
        content: post.excerpt.rendered.replace(/<[^>]*>?/gm, '').replace(/&#8211;/g, '-').replace(/&#8212;/g, '—').replace(/&nbsp;/g, ' '),
        date: post.date,
        category: post._embedded?.['wp:term']?.[0]?.[0]?.name?.toUpperCase() || 'NOTÍCIAS',
        thumbnail: post._embedded?.['wp:featuredmedia']?.[0]?.source_url || 'https://images.unsplash.com/photo-1523733593134-a15d80966249?auto=format&fit=crop&q=80&w=1200',
        link: post.link
      }));
      
      newsData = mappedNews;
      console.log(`Successfully fetched ${newsData.length} news items from CPAD News`);
    } catch (error) {
      console.error('Error fetching CPAD news:', error);
    }
  };

  // Initial fetch and set interval
  fetchCpadNews();
  setInterval(fetchCpadNews, 1000 * 60 * 30); // Refresh every 30 minutes

  // API Routes
  app.get("/health", (req, res) => {
    res.json({ status: "ok", mode: process.env.NODE_ENV });
  });

  app.get("/api/news", (req, res) => {
    res.json(newsData);
  });

  app.get("/api/holyrics", (req, res) => {
    res.json(holyricsData);
  });

  app.post("/api/holyrics", (req, res) => {
    const { type, title, artist, text, next_text } = req.body;
    holyricsData = {
      type: type || 'song',
      title: title || '',
      artist: artist || '',
      text: text || '',
      next_text: next_text || '',
      timestamp: Date.now()
    };
    console.log(`[HOLYRICS] Received update: ${title} - ${text.substring(0, 20)}...`);
    res.json({ success: true, timestamp: holyricsData.timestamp });
  });

  app.post("/api/news", (req, res) => {
    const { news } = req.body;
    newsData = news;
    res.json({ success: true, timestamp: Date.now() });
  });

  app.get("/api/screens/:id/content", (req, res) => {
    const { id } = req.params;
    res.json(screenPlaylists[id] || { playlist: [], timestamp: 0, mode: 'playlist' });
  });

  app.get("/api/screens/metrics", (req, res) => {
    // Simulate real-time metrics for all screens
    // In a real app, this would fetch from a database or connected devices
    const metrics: Record<string, any> = {};
    
    // We can't easily know all screen IDs here without a DB, 
    // but we can return metrics for the ones we've seen in screenPlaylists
    // or just return a generic set that the client can filter.
    
    const allKnownIds = new Set([...Object.keys(screenPlaylists), 's1', 's2', 's3']);
    
    allKnownIds.forEach(id => {
      metrics[id] = {
        latency: Math.floor(Math.random() * 30) + 5,
        cpuUsage: Math.floor(Math.random() * 40) + 20,
        gpuUsage: Math.floor(Math.random() * 30) + 15,
        temperature: Math.floor(Math.random() * 15) + 40,
      };
    });
    
    res.json(metrics);
  });

  app.post("/api/screens/:id/power", (req, res) => {
    const { id } = req.params;
    const { power } = req.body;
    console.log(`Power command for screen ${id}: ${power ? 'ON' : 'OFF'}`);
    res.json({ success: true, id, power });
  });

  app.post("/api/screens/:id/restart", (req, res) => {
    const { id } = req.params;
    console.log(`Restart command for screen ${id}`);
    res.json({ success: true, id });
  });

  app.post("/api/publish", (req, res) => {
    const { screenIds, playlist, mode = 'playlist' } = req.body;
    const timestamp = Date.now();
    
    if (!screenIds || !Array.isArray(screenIds) || screenIds.length === 0) {
      console.error("Publish failed: No screen IDs provided");
      return res.status(400).json({ error: "screenIds is required and must be a non-empty array" });
    }

    if (mode === 'playlist' && (!playlist || !Array.isArray(playlist) || playlist.length === 0)) {
      console.error("Publish failed: Empty playlist provided");
      return res.status(400).json({ error: "playlist is required and must be a non-empty array" });
    }

    console.log(`[PUBLISH] Sending ${mode} to screens: ${screenIds.join(', ')}`);
    
    screenIds.forEach((id: string) => {
      screenPlaylists[id] = { playlist: playlist || [], timestamp, mode };
      console.log(`[PUBLISH] Updated screen ${id} with timestamp ${timestamp} and mode ${mode}`);
    });
    
    savePlaylists();
    res.json({ success: true, timestamp });
  });

  // Vite middleware for development
  const isProduction = process.env.NODE_ENV === "production";
  console.log(`Starting server in ${isProduction ? 'production' : 'development'} mode...`);

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    console.log(`Serving static files from: ${distPath}`);
    
    // Serve static files
    app.use(express.static(distPath));
    
    // Fallback for SPA
    app.get('*', (req, res) => {
      const indexPath = path.join(distPath, 'index.html');
      console.log(`Fallback: serving ${indexPath}`);
      res.sendFile(indexPath, (err) => {
        if (err) {
          console.error(`Error sending index.html: ${err}`);
          res.status(404).send("Page not found - index.html missing");
        }
      });
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
