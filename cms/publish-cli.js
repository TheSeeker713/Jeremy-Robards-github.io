#!/usr/bin/env node

/**
 * CLI wrapper for publish() function
 * Provides a simpler command-line interface with better error messages
 */

import { publish } from "./publish.js";

const args = process.argv.slice(2);
const verbose = args.includes("--verbose") || args.includes("-v");
const help = args.includes("--help") || args.includes("-h");
const outDir = args.find((arg) => !arg.startsWith("-")) || "./dist";

if (help) {
  console.log(`
📦 Cloudflare Pages Publish Tool

Usage:
  node cms/publish-cli.js [outDir] [options]
  npm run cms:publish

Arguments:
  outDir              Directory to deploy (default: ./dist)

Options:
  -v, --verbose       Show detailed progress
  -h, --help          Show this help message

Examples:
  node cms/publish-cli.js
  node cms/publish-cli.js ./dist --verbose
  node cms/publish-cli.js ./build -v

Environment Variables (required):
  CF_ACCOUNT_ID       Cloudflare account ID
  CF_API_TOKEN        Cloudflare API token
  CF_PAGES_PROJECT    Cloudflare Pages project name

Setup:
  1. Copy .env.example to .env
  2. Fill in your Cloudflare credentials
  3. Install wrangler: npm install -g wrangler
  4. Run: npm run cms:publish

Documentation: cms/PUBLISH_README.md
`);
  process.exit(0);
}

console.log("📦 Cloudflare Pages Publisher\n");

publish(outDir, { verbose, maxRetries: 3, initialBackoff: 1000 })
  .then((result) => {
    console.log("\n✅ Deployment successful!\n");
    console.log("📊 Results:");
    console.log(`   URL:      ${result.url || "N/A"}`);
    console.log(`   Files:    ${result.count}`);
    console.log(`   Size:     ${(result.size / 1024).toFixed(2)} KB`);
    console.log(`   Duration: ${(result.duration / 1000).toFixed(2)}s`);
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Deployment failed\n");
    console.error(`Error: ${error.message}`);
    
    if (error.code === "ENOENT") {
      console.error("\n💡 Install wrangler CLI:");
      console.error("   npm install -g wrangler");
    } else {
      console.error("\n💡 Troubleshooting:");
      console.error("   • Check .env file has correct credentials");
      console.error("   • Ensure dist/ directory exists and has content");
      console.error("   • Review log file for details");
      console.error("   • Run: node cms/test-publish.js");
    }
    
    process.exit(1);
  });
