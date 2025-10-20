/**
 * CMS Development Server
 *
 * Serves the editor UI and provides API endpoints for export/publish operations.
 * This bridges the browser-based editor with Node.js-only functions.
 */

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { promises as fs } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

// Check if TypeScript has been compiled
const REQUIRED_MODULES = [path.join(ROOT_DIR, '.build', 'cms', 'export.js')];

async function checkCompilation() {
  for (const modulePath of REQUIRED_MODULES) {
    try {
      await fs.access(modulePath);
    } catch {
      console.error('\n❌ Error: TypeScript files not compiled\n');
      console.error('Required module not found:', modulePath);
      console.error('\n💡 Run this command first:');
      console.error('   npm run cms:compile\n');
      process.exit(1);
    }
  }
}

const app = express();
const PORT = process.env.CMS_PORT || 5173;

// Middleware
app.use(
  cors({
    origin: [`http://localhost:${PORT}`, 'http://127.0.0.1:' + PORT],
    credentials: true,
  })
);
app.use(express.json({ limit: '50mb' }));

// Logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
});

// Serve static files from editor directory
app.use(express.static(path.join(ROOT_DIR, 'editor')));

// Serve shared modules (needed by preview)
app.use('/shared', express.static(path.join(ROOT_DIR, 'shared')));

// Serve templates (needed by preview)
app.use('/templates', express.static(path.join(ROOT_DIR, 'templates')));

// Serve CSS (needed by preview iframe)
app.use('/css', express.static(path.join(ROOT_DIR, 'css')));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'cms-dev-server',
    port: PORT,
    endpoints: ['POST /api/export', 'POST /api/publish', 'GET  /api/health'],
  });
});

// Export endpoint - converts draft to static HTML/Markdown
app.post('/api/export', async (req, res) => {
  try {
    const draft = req.body;

    if (!draft || !draft.metadata || !Array.isArray(draft.blocks)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid draft format. Expected { metadata, blocks }',
      });
    }

    console.log(`→ Exporting article: ${draft.metadata.title || 'Untitled'}`);

    // Import the compiled export module from .build/
    const { exportArticle } = await import('../.build/cms/export.js');

    const outDir = path.join(ROOT_DIR, 'dist');
    await exportArticle(draft, outDir);

    const slug = draft.metadata.slug || 'article';
    const publishedDate = new Date(draft.metadata.published_at || Date.now());
    const year = publishedDate.getUTCFullYear();
    const month = String(publishedDate.getUTCMonth() + 1).padStart(2, '0');
    const articlePath = path.posix.join('article', String(year), month, slug, 'index.html');

    res.json({
      success: true,
      message: 'Article exported successfully',
      data: {
        slug,
        path: articlePath,
        outDir: path.relative(ROOT_DIR, outDir),
      },
    });
  } catch (error) {
    console.error('Export error:', error);

    res.status(500).json({
      success: false,
      error: error.message,
      details: error.stack?.split('\n').slice(0, 5).join('\n'),
    });
  }
});

// Publish endpoint - deploys dist to Cloudflare Pages
app.post('/api/publish', async (req, res) => {
  try {
    const { outDir = './dist' } = req.body;

    console.log(`→ Publishing ${outDir} to Cloudflare Pages...`);

    // Check if dist exists before attempting publish
    const distPath = path.resolve(ROOT_DIR, outDir);
    try {
      await fs.access(distPath);
    } catch {
      return res.status(400).json({
        success: false,
        error: `Directory ${outDir} does not exist. Export an article first.`,
        hint: "Click 'Export Draft' before publishing",
      });
    }

    // Import the compiled publish module from .build/
    const { publish } = await import('../.build/cms/publish.js');

    const result = await publish(distPath, {
      verbose: true,
      maxRetries: 3,
      initialBackoff: 1000,
    });

    res.json({
      success: true,
      message: 'Deployment successful',
      data: result,
    });
  } catch (error) {
    console.error('Publish error:', error);

    const statusCode = error.code === 'ENOENT' ? 503 : 500;

    res.status(statusCode).json({
      success: false,
      error: error.message,
      code: error.code,
      hint:
        error.code === 'ENOENT'
          ? 'Install wrangler: npm install -g wrangler'
          : 'Check console logs and cms/logs/ for details',
    });
  }
});

// Fallback - this should be last to catch unmatched routes
// Only serve index.html for routes that don't match API/static files
app.use((req, res, next) => {
  // If not an API route or static file, serve the SPA index.html
  if (!req.path.startsWith('/api/') && !req.path.match(/\.\w+$/)) {
    res.sendFile(path.join(ROOT_DIR, 'editor', 'index.html'));
  } else {
    next();
  }
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: err.message,
  });
});

// Start server
const server = app.listen(PORT, async () => {
  // Verify TypeScript compilation on startup
  await checkCompilation();

  console.log('\n🚀 CMS Development Server');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📝 Editor UI:   http://localhost:${PORT}`);
  console.log(`🔌 API:         http://localhost:${PORT}/api/health`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\n📡 Endpoints:');
  console.log(`   POST /api/export  - Export draft to /dist`);
  console.log(`   POST /api/publish - Deploy to Cloudflare Pages`);
  console.log(`   GET  /api/health  - Server status`);
  console.log('\n💡 Tips:');
  console.log('   • Import a Markdown/JSON/PDF file to start');
  console.log('   • Edit metadata and blocks in the panels');
  console.log('   • Preview updates live in the right panel');
  console.log('   • Export creates /dist with static HTML');
  console.log('   • Publish deploys /dist to Cloudflare');
  console.log('\n⏹️  Press Ctrl+C to stop\n');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('\n🛑 SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('✓ Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\n\n🛑 Server stopped');
  process.exit(0);
});

// Handle unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
