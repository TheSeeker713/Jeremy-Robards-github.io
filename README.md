# Jeremy Robards Portfolio

Static portfolio site with Motion Picture & Design and Innovative Interactive Systems.

## Structure
- index.html – Landing navigation
- mpd.html – Motion Picture & Design
- iis.html – Innovative Interactive Systems
- about.html – About/contact
- css/tailwind.css, css/style.css – Styling
- js/main.js – Core interactions

## Development
- Install dependencies: npm install
- Build CSS: npm run build:css
- Local serve example: python -m http.server 8000

## Deployment
- Cloudflare Pages: npm run deploy (or npm run deploy:verbose)
- Smoke deploy: npm run deploy:test

## Notes
- Assets use relative paths for GitHub Pages compatibility.
- Event handling uses data-action="navigate" with delegated listeners in js/main.js.
