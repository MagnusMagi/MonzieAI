# 📚 Documentation Website Setup Guide

This guide will help you set up and deploy the MonzieAI documentation website powered by Docusaurus.

## 🎯 Overview

The documentation website is located in the `website/` directory and is automatically deployed to GitHub Pages when changes are pushed to the `main` branch.

**Live Site**: [https://magnusmagi.github.io/monzieai/](https://magnusmagi.github.io/monzieai/)

## 🚀 Quick Start

### Prerequisites

- Node.js 18.0 or higher
- npm or yarn
- Git

### Local Development

```bash
# Navigate to website directory
cd website

# Install dependencies
npm install

# Copy documentation files from ../docs
./copy-docs.sh

# Start development server
npm start
```

The site will open at `http://localhost:3000/monzieai/`

## 📁 Project Structure

```
website/
├── docs/                      # Documentation markdown files (auto-synced)
│   ├── intro.md              # Welcome page
│   ├── setup.md              # Setup guide
│   ├── architecture.md       # Architecture docs
│   ├── api.md                # API reference
│   └── ...                   # Other docs
├── src/
│   ├── components/           # React components
│   │   └── HomepageFeatures/ # Feature cards
│   ├── css/
│   │   └── custom.css        # Custom styles
│   └── pages/
│       └── index.tsx         # Homepage
├── static/
│   └── img/                  # Images and assets
│       ├── logo.svg          # Site logo
│       └── favicon.ico       # Favicon
├── docusaurus.config.js      # Docusaurus configuration
├── sidebars.js               # Sidebar navigation
├── copy-docs.sh              # Script to sync docs from ../docs
├── package.json              # Dependencies
└── README.md                 # Website-specific readme
```

## 🔧 Configuration

### Site Metadata

Edit `docusaurus.config.js`:

```javascript
const config = {
  title: 'MonzieAI Documentation',
  tagline: 'AI-Powered Photo Enhancement & Social Platform',
  url: 'https://magnusmagi.github.io',
  baseUrl: '/monzieai/',
  organizationName: 'magnusmagi',
  projectName: 'monzieai',
};
```

### Sidebar Navigation

Edit `sidebars.js` to customize the documentation structure:

```javascript
const sidebars = {
  tutorialSidebar: [
    'intro',
    {
      type: 'category',
      label: '🚀 Getting Started',
      items: ['setup', 'deployment'],
    },
    // ... more sections
  ],
};
```

### Theme Colors

Customize colors in `src/css/custom.css`:

```css
:root {
  --ifm-color-primary: #7C3AED;
  --ifm-color-primary-dark: #6D28D9;
  --ifm-color-primary-light: #8B5CF6;
}
```

## 📝 Adding Documentation

### Method 1: Edit in ../docs (Recommended)

1. Edit or create markdown files in the `../docs` directory
2. Run the sync script:
   ```bash
   cd website
   ./copy-docs.sh
   ```
3. Preview changes:
   ```bash
   npm start
   ```

### Method 2: Edit in website/docs

1. Create/edit markdown files directly in `website/docs/`
2. Add frontmatter:
   ```markdown
   ---
   sidebar_position: 1
   title: Your Title
   description: Your description
   ---
   
   # Your Content
   ```
3. Update `sidebars.js` if adding new files

## 🎨 Customization

### Homepage

Edit `src/pages/index.tsx` to customize:
- Hero section
- Call-to-action buttons
- Quick links
- Tech stack badges

### Features Section

Edit `src/components/HomepageFeatures/index.tsx` to update feature cards.

### Styling

- **Global styles**: `src/css/custom.css`
- **Component styles**: `*.module.css` files next to components
- **Dark mode**: Automatically supported with theme switching

### Logo and Favicon

Replace files in `static/img/`:
- `logo.svg` - Navigation logo
- `favicon.ico` - Browser favicon

## 🚢 Deployment

### Automatic Deployment (GitHub Actions)

The site automatically deploys when you push to `main`:

1. Make changes to docs or website
2. Commit and push to `main` branch
3. GitHub Actions builds and deploys automatically
4. Site updates at: `https://magnusmagi.github.io/monzieai/`

### Manual Deployment

```bash
# Build the site
npm run build

# Test the build locally
npm run serve

# Deploy to GitHub Pages (manual)
GIT_USER=<your-github-username> npm run deploy
```

## 🔍 Search Configuration (Optional)

To enable Algolia DocSearch:

1. Apply for DocSearch at: https://docsearch.algolia.com/apply/
2. Once approved, update `docusaurus.config.js`:
   ```javascript
   algolia: {
     appId: 'YOUR_APP_ID',
     apiKey: 'YOUR_API_KEY',
     indexName: 'monzieai',
   }
   ```

## 📦 Build & Test

```bash
# Development build (with hot reload)
npm start

# Production build
npm run build

# Test production build locally
npm run serve

# Clear cache
npm run clear

# Type checking
npm run docusaurus -- --help
```

## 🐛 Troubleshooting

### Build Fails

```bash
# Clear cache and rebuild
npm run clear
rm -rf node_modules package-lock.json .docusaurus
npm install
npm run build
```

### Docs Not Syncing

```bash
# Re-run the copy script
cd website
./copy-docs.sh

# Restart with cleared cache
npm start -- --no-cache
```

### Port Already in Use

```bash
# Use different port
npm start -- --port 3001
```

### MDX Compilation Errors

Common issues:
- **JSX in markdown**: Escape curly braces with backticks: `` `{variable}` ``
- **HTML-like syntax**: Avoid `<text>` in plain text, use `less than` instead
- **Missing closing tags**: Ensure all HTML elements are properly closed

### Link Issues

- Use relative paths: `[Link](./other-doc)`
- For external links: `[Link](https://example.com)`
- For internal sections: `[Link](#section-id)`

## 📊 Analytics (Optional)

### Google Analytics

Add to `docusaurus.config.js`:

```javascript
gtag: {
  trackingID: 'G-XXXXXXXXXX',
  anonymizeIP: true,
}
```

### Other Analytics

Use plugins like:
- `@docusaurus/plugin-google-analytics`
- `@docusaurus/plugin-google-gtag`

## 🔐 Environment Variables

Create `.env` file (not committed):

```env
# Algolia Search (optional)
ALGOLIA_APP_ID=your_app_id
ALGOLIA_API_KEY=your_api_key
ALGOLIA_INDEX_NAME=monzieai

# Analytics (optional)
GA_TRACKING_ID=G-XXXXXXXXXX
```

## 🤝 Contributing to Docs

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b docs/improve-setup`
3. **Edit** documentation in `../docs` or `website/docs`
4. **Test** locally: `npm start`
5. **Build** to verify: `npm run build`
6. **Commit** with clear message: `docs: improve setup guide`
7. **Push** and create a Pull Request

## 📋 Checklist for Updates

- [ ] Documentation files updated in `../docs`
- [ ] Run `./copy-docs.sh` to sync
- [ ] Test locally with `npm start`
- [ ] Build succeeds with `npm run build`
- [ ] All links work correctly
- [ ] Images display properly
- [ ] No console errors
- [ ] Mobile responsive
- [ ] Dark mode works
- [ ] Commit and push to trigger deployment

## 🔗 Useful Links

- **Live Site**: https://magnusmagi.github.io/monzieai/
- **Docusaurus Docs**: https://docusaurus.io/docs
- **Markdown Guide**: https://docusaurus.io/docs/markdown-features
- **Deployment Guide**: https://docusaurus.io/docs/deployment
- **GitHub Actions**: https://docs.github.com/en/actions

## 📞 Support

- **Documentation Issues**: Open an issue in the repository
- **Docusaurus Help**: https://docusaurus.io/community/support
- **Build Problems**: Check `.github/workflows/deploy-docs.yml` logs

## 🎓 Tips & Best Practices

### Documentation Writing

- Use clear, concise language
- Include code examples
- Add screenshots where helpful
- Keep paragraphs short
- Use headings for structure
- Include links to related docs

### Markdown Tips

- Use admonitions for important notes:
  ```markdown
  :::note
  This is important information
  :::
  ```
- Add tabs for multiple options:
  ```markdown
  <Tabs>
    <TabItem value="npm" label="npm">
      npm install
    </TabItem>
    <TabItem value="yarn" label="Yarn">
      yarn install
    </TabItem>
  </Tabs>
  ```

### Performance

- Optimize images before adding
- Use SVG for logos and icons
- Lazy load heavy components
- Keep bundle size small

### SEO

- Add meta descriptions to frontmatter
- Use descriptive titles
- Include alt text for images
- Create sitemap (auto-generated)

## 🏆 Production Checklist

Before deploying to production:

- [ ] All documentation is up-to-date
- [ ] Broken links are fixed
- [ ] Code examples are tested
- [ ] Screenshots are current
- [ ] SEO metadata is complete
- [ ] Analytics are configured
- [ ] Search is working (if enabled)
- [ ] Mobile view is tested
- [ ] Dark mode is tested
- [ ] Build has no warnings
- [ ] GitHub Actions workflow is tested

## 📈 Monitoring

After deployment:

- Check GitHub Pages deployment status
- Verify site loads at production URL
- Test all major navigation paths
- Check Google Search Console (if configured)
- Monitor analytics for traffic
- Review error logs if any

---

**Last Updated**: December 2024
**Maintainer**: @magnusmagi
**Status**: ✅ Production Ready

For questions or issues, please open a GitHub issue or refer to the main [README.md](../README.md).