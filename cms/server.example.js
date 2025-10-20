/**
 * Example integration: HTTP bridge for editor UI
 *
 * Simple Express server that exposes the publish() function via REST API.
 * The editor can POST to /api/publish to trigger deployment.
 *
 * Start: node cms/server.js
 * Test: curl -X POST http://localhost:3001/api/publish -H "Content-Type: application/json" -d '{"outDir":"./dist"}'
 */

import express from 'express';
import cors from 'cors';
import { publish } from './publish.js';

const app = express();
const PORT = process.env.CMS_SERVER_PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'cms-publish-server' });
});

// Publish endpoint
app.post('/api/publish', async (req, res) => {
  const { outDir = './dist' } = req.body;

  try {
    console.log(`→ Publishing ${outDir}...`);

    const result = await publish(outDir, {
      verbose: true,
      maxRetries: 3,
      initialBackoff: 1000,
    });

    res.json({
      success: true,
      data: result,
      message: 'Deployment successful',
    });
  } catch (error) {
    console.error('Publish error:', error.message);

    res.status(error.code === 'ENOENT' ? 503 : 500).json({
      success: false,
      error: error.message,
      code: error.code,
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 CMS Publish Server running on http://localhost:${PORT}`);
  console.log(`   POST /api/publish - Trigger deployment`);
  console.log(`   GET  /health      - Health check`);
  console.log('\nPress Ctrl+C to stop');
});
