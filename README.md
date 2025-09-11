# React + Vite
## About this project

This repository contains the source for my personal portfolio site (jeremyrobards.com). The site is a lightweight, React + Vite single-page application that showcases projects, skills, a résumé, and contact details. It’s designed for fast local iteration (HMR), accessible markup, and easy static deployment.

## Goals

- Present a curated selection of projects and case studies.
- Provide a clear, scannable résumé and contact options.
- Be performant and easy to maintain.
- Serve as a living example of frontend engineering choices (React + Vite, ESLint).

## Key features

- Project gallery with links and descriptions
- Resume / About section
- Contact form or mailto link
- Responsive, accessible UI
- Fast local development with HMR
- Production build optimized for static hosting

## Tech stack

- React
- Vite (dev server, build)
- ESLint (linting rules; consider enabling TypeScript for type-aware linting)
- Optional: CSS-in-JS or utility CSS (project-dependent)

## Local development

1. Install dependencies
    - npm install
2. Start dev server with HMR
    - npm run dev
3. Preview production build locally
    - npm run build
    - npm run preview

(If you use yarn or pnpm, substitute commands accordingly.)

## Build & deploy

- Build a production bundle:
  - npm run build
- Deploy the generated `dist/` folder to any static host (Netlify, Vercel, GitHub Pages, Cloudflare Pages).
- For GitHub Pages, serve `dist/` via a static-file action or configure your CI to push `dist/` to the gh-pages branch.

## Project structure (high level)

- src/ — application source (components, pages, assets)
- public/ — static assets copied to the build
- vite.config.* — Vite configuration
- .eslintrc.* — linting rules

Organize new projects or case studies under src/content or src/data and reference them from the project listing components.

## Contributing

- Fork, create a branch, and open a PR.
- Follow existing code style and lint rules.
- Keep changes focused to content, styling, or small features unless coordinated.

## Contact & license

- Site owner: Jeremy Robards — contact via the site’s contact section or email.
- License: choose an appropriate open-source license for code and state license for content.
- For questions about deployment or content updates, open an issue or contact via the site.

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
