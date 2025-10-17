# Portfolio CMS Roadmap

This repository now includes scaffolding for a lightweight, offline-first content management workflow that supports the dual Cloudflare Pages deployment architecture.

## Workflow Overview

1. **Prepare content locally**
   - Drop Markdown, JSON, or PDF sources into the CMS input pipeline.
   - Use the offline block editor in `editor/` to normalize structure, manage metadata, and compose article blocks.

2. **Export site artifacts**
   - `cms/exporters/` will emit Markdown with frontmatter and matching static HTML builds suitable for static hosting.
   - Generated assets and article bundles land under `articles/` for archival and diffing.
   - Shared site assets can live in `public/` should the CMS need to stage uploads.

3. **Publish to Cloudflare Pages**
   - Helper scripts in `cms/publish/` will package article bundles and call Cloudflare Pages Direct Upload for the articles project (Project B).
   - The existing GitHub-driven site (Project A) continues to deploy via standard commits.

4. **Serve articles on the main domain**
   - A tiny Worker in `worker/` will proxy `/article/*` traffic to the Project B deployment.

5. **Observe and iterate**
   - CLI bootstrap utilities will live in `cms/setup/`.
   - Execution logs are stored in `cms/logs/` for review during development.

## Next Steps

- Flesh out the editor UI with a small block-based editing surface.
- Implement exporters and publishing scripts with minimal dependencies.
- Build the Cloudflare Worker to forward article routes to the Direct Upload project.
