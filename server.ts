import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || '3000', 10);

  app.use(express.json({ limit: '10mb' }));

  // Health check endpoint
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // AI Motion Director endpoint
  app.post('/api/gemini/motion-director', async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({
          error: 'GEMINI_API_KEY is not configured in the environment.'
        });
      }

      const { prompt, style = 'modern tech', duration = 12 } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
      }

      const ai = new GoogleGenAI({ apiKey });

      const systemPrompt = `You are an elite Motion Graphics Director and Remotion/Three.js creative technologist.
Given a user's creative brief, generate a structured motion graphics timeline composition with scenes, kinetic typography, visual elements, easing styles, color palette, and synchronized procedural sound cues (blip, pop, click, whoosh, chime, impact, riser).

The duration should be approximately ${duration} seconds.
Output strictly valid JSON with no markdown backticks or commentary matching this JSON schema:
{
  "title": "string",
  "theme": "dark" | "light" | "cyber" | "editorial",
  "palette": {
    "bg": "hex string",
    "accent": "hex string",
    "text": "hex string",
    "secondary": "hex string"
  },
  "duration": number,
  "fps": 60,
  "scenes": [
    {
      "id": "s1",
      "name": "Scene 1: Hook",
      "startTime": 0,
      "endTime": 3.5,
      "headline": "Short punchy headline",
      "subline": "Subtitle or mono caption",
      "accentWord": "single word from headline",
      "motionStyle": "word_mask" | "slide_spring" | "glitch_reveal" | "isometric_card" | "3d_burst",
      "elements": ["string descriptions"],
      "soundCues": [
        { "time": 0.2, "type": "whoosh", "label": "Entrance swoop" },
        { "time": 0.5, "type": "pop", "label": "Badge pop" },
        { "time": 1.2, "type": "chime", "label": "Accent chime" }
      ]
    }
  ],
  "soundtracks": [
    { "time": 0.1, "type": "whoosh" }
  ]
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: `${systemPrompt}\n\nUser Brief:\n${prompt}\nStyle preference: ${style}`
              }
            ]
          }
        ],
        config: {
          responseMimeType: 'application/json'
        }
      });

      const responseText = response.text?.trim() || '{}';
      const cleanJson = responseText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      const parsedData = JSON.parse(cleanJson);

      return res.json({ success: true, project: parsedData });
    } catch (err: any) {
      console.error('Error generating motion script:', err);
      return res.status(500).json({
        error: err.message || 'Failed to generate motion script'
      });
    }
  });

  // Mount Vite middleware in development mode
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Motion Graphics Studio running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
