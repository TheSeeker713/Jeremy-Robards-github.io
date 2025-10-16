import fs from 'fs/promises';
import path from 'path';

const articlesDir = path.resolve('articles');
const manifestPath = path.join(articlesDir, 'manifest.json');

async function generateManifest() {
  try {
    const files = await fs.readdir(articlesDir);
    const mdFiles = files.filter(file => file.endsWith('.md'));
    await fs.writeFile(manifestPath, JSON.stringify(mdFiles, null, 2));
    console.log('Successfully created articles manifest!');
  } catch (error) {
    // If the directory doesn't exist, create an empty manifest
    if (error.code === 'ENOENT') {
      await fs.mkdir(articlesDir, { recursive: true });
      await fs.writeFile(manifestPath, JSON.stringify([], null, 2));
      console.log('Created _articles directory and empty manifest.');
    } else {
      console.error('Error generating articles manifest:', error);
    }
  }
}

generateManifest();
