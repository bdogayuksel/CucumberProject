import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { fal } from '@fal-ai/client';

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true }));

fal.config({ credentials: process.env.FAL_KEY });

app.get('/health', (req, res) => {
  res.json({ ok: true, service: 'iclight-proxy', configured: Boolean(process.env.FAL_KEY) });
});

app.post('/api/iclight', upload.single('image'), async (req, res) => {
  try {
    const prompt = (req.body?.prompt || '').toString();
    const imageUrl = req.body?.image_url ? req.body.image_url.toString() : undefined;
    const imageSize = req.body?.image_size ? req.body.image_size : 'square';
    const outputFormat = req.body?.output_format ? req.body.output_format : 'png';

    if (!prompt) {
      return res.status(400).json({ error: 'Missing prompt' });
    }

    let finalImageUrl = imageUrl;
    if (!finalImageUrl && req.file) {
      const blob = new Blob([req.file.buffer], { type: req.file.mimetype || 'application/octet-stream' });
      finalImageUrl = await fal.storage.upload(blob);
    }

    if (!finalImageUrl) {
      return res.status(400).json({ error: 'Provide image_url or upload image file' });
    }

    const { data, requestId } = await fal.subscribe('fal-ai/iclight-v2', {
      input: {
        prompt,
        image_url: finalImageUrl,
        image_size: imageSize,
        output_format: outputFormat,
        sync_mode: true
      }
    });

    const first = data?.images?.[0];
    if (!first?.url) {
      return res.status(502).json({ error: 'No image returned', requestId, raw: data });
    }

    return res.json({ url: first.url, content_type: first.content_type, requestId });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error', message: err?.message || String(err) });
  }
});

const port = process.env.PORT || 8787;
app.listen(port, () => {
  console.log(`[server] listening on http://localhost:${port}`);
});