import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { analyzeWasteImage } from './server/services/geminiService';
import { municipalCameras } from './server/services/cctvService';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Body parser with 30mb limit for camera/photo base64 data
app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ extended: true, limit: '30mb' }));

// Health and Supabase configuration diagnostic
app.get('/api/config/status', (_req, res) => {
  const hasSupabaseUrl = Boolean(process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL);
  const hasSupabaseKey = Boolean(process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY);
  const hasGeminiKey = Boolean(process.env.GEMINI_API_KEY);

  res.json({
    status: 'ok',
    systemName: 'Шаҳри Покиза',
    version: '1.0.0-competition',
    configuredServices: {
      supabasePostgres: hasSupabaseUrl && hasSupabaseKey,
      geminiVisionAI: hasGeminiKey,
      cctvModule: true,
      mode: hasSupabaseUrl && hasSupabaseKey ? 'production_supabase' : 'demonstration_mode',
    },
    defaultCity: 'Хуҷанд',
    supportedCities: ['Хуҷанд', 'Душанбе', 'Бохтар', 'Кӯлоб'],
  });
});

// Gemini Waste Image Analysis API
app.post('/api/ai/analyze-waste', async (req, res) => {
  try {
    const { image, mimeType } = req.body;
    if (!image) {
      return res.status(400).json({ error: 'Акс пешниҳод нашудааст (No image provided)' });
    }

    const analysis = await analyzeWasteImage(image, mimeType || 'image/jpeg');
    res.json({ success: true, analysis });
  } catch (error) {
    console.error('API /api/ai/analyze-waste error:', error);
    res.status(500).json({
      error: 'Хатогӣ ҳангоми таҳлили тасвир бо зеҳни сунъӣ',
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

// CCTV camera list and camera status
app.get('/api/cctv/devices', (_req, res) => {
  res.json({ cameras: municipalCameras });
});

// Start Express server and mount Vite in development
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production static serving
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Шаҳри Покиза] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
