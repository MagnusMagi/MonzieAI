# MonzieAI Documentation Website

This directory contains the Docusaurus-powered documentation website for MonzieAI.

## 🚀 Quick Start

### Development

```bash
# Install dependencies
npm install

# Copy documentation from ../docs
./copy-docs.sh

# Start development server
npm start
```

The site will be available at `http://localhost:3000`

### Build

```bash
# Production build
npm run build

# Test the build locally
npm run serve
```

## 📁 Project Structure

```
website/
├── docs/                   # Documentation markdown files
├── src/
│   ├── components/        # React components
│   ├── css/              # Global styles
│   └── pages/            # Custom pages (homepage, etc)
├── static/               # Static assets (images, files)
├── docusaurus.config.js  # Docusaurus configuration
├── sidebars.js           # Sidebar navigation structure
├── copy-docs.sh          # Script to sync docs from ../docs
└── package.json          # Dependencies
```

## 📝 Adding Documentation

### Method 1: Edit in ../docs (Recommended)

1. Edit or create markdown files in the `../docs` directory
2. Run `./copy-docs.sh` to sync changes
3. Preview with `npm start`

### Method 2: Edit in website/docs

1. Create/edit markdown files directly in `website/docs/`
2. Add frontmatter:
   ```markdown
   ---
   sidebar_position: 1
   title: Your Title
   ---
   
   # Your Content
   ```
3. Update `sidebars.js` if needed

## 🎨 Customization

### Theme Colors

Edit `src/css/custom.css` to customize colors:

```css
:root {
  --ifm-color-primary: #7C3AED;
  --ifm-color-primary-dark: #6D28D9;
  /* ... */
}
```

### Homepage

Edit `src/pages/index.tsx` and `src/components/HomepageFeatures/`

### Navigation

Edit `docusaurus.config.js` navbar and footer sections

### Sidebar

Edit `sidebars.js` to reorganize documentation structure

## 🚢 Deployment

### GitHub Pages (Automatic)

The site automatically deploys to GitHub Pages when you push to `main`:

1. Push changes to `main` branch
2. GitHub Actions builds and deploys
3. Site available at: `https://magnusmagi.github.io/monzieai/`

### Manual Deploy

```bash
# Set GIT_USER environment variable
export GIT_USER=<Your GitHub username>

# Deploy to GitHub Pages
npm run deploy
```

## 📚 Documentation Structure

- **intro.md** - Welcome page (auto-generated from intro template)
- **setup.md** - Setup and installation guide
- **deployment.md** - Deployment instructions
- **architecture.md** - System architecture
- **database.md** - Database schema
- **services.md** - Service layer documentation
- **components.md** - UI components
- **features.md** - Feature documentation
- **screens.md** - Screen flows
- **api.md** - API reference
- **testing.md** - Testing guide
- **troubleshooting.md** - Common issues
- **contributing.md** - Contributing guidelines
- **security.md** - Security policy
- **changelog.md** - Version history

## 🔧 Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start dev server |
| `npm run build` | Build for production |
| `npm run serve` | Serve production build locally |
| `npm run clear` | Clear Docusaurus cache |
| `./copy-docs.sh` | Sync docs from ../docs |

## 🌐 Configuration

### Site Metadata

Edit in `docusaurus.config.js`:

```javascript
{
  title: 'MonzieAI Documentation',
  tagline: 'AI-Powered Photo Enhancement',
  url: 'https://magnusmagi.github.io',
  baseUrl: '/monzieai/',
  organizationName: 'magnusmagi',
  projectName: 'monzieai',
}
```

### Search (Algolia)

To enable search, get Algolia credentials and update `docusaurus.config.js`:

```javascript
algolia: {
  appId: 'YOUR_APP_ID',
  apiKey: 'YOUR_API_KEY',
  indexName: 'monzieai',
}
```

## 🎯 Features

- ✅ Automatic documentation deployment
- ✅ Dark/Light theme
- ✅ Mobile responsive
- ✅ Code syntax highlighting
- ✅ Search (with Algolia)
- ✅ Version control ready
- ✅ SEO optimized
- ✅ Custom homepage
- ✅ Beautiful UI with gradients

## 🐛 Troubleshooting

### Build Fails

```bash
# Clear cache and rebuild
npm run clear
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Docs Not Updating

```bash
# Re-run the copy script
./copy-docs.sh

# Restart dev server
npm start -- --no-cache
```

### Port Already in Use

```bash
# Start on different port
npm start -- --port 3001
```

## 📖 Resources

- [Docusaurus Documentation](https://docusaurus.io/)
- [Markdown Guide](https://docusaurus.io/docs/markdown-features)
- [Deployment Guide](https://docusaurus.io/docs/deployment)
- [Customization](https://docusaurus.io/docs/styling-layout)

## 🤝 Contributing

1. Make changes to documentation in `../docs`
2. Run `./copy-docs.sh` to sync
3. Test locally with `npm start`
4. Commit changes
5. Push to GitHub
6. GitHub Actions will auto-deploy

## 📄 License

Copyright © 2024 Some Planets. All rights reserved.

---

**Built with [Docusaurus](https://docusaurus.io/) 💚**