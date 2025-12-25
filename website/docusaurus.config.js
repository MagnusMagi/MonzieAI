// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require('prism-react-renderer').themes.github;
const darkCodeTheme = require('prism-react-renderer').themes.dracula;

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'MonzieAI Documentation',
  tagline: 'AI-Powered Photo Enhancement & Social Platform',
  favicon: 'img/favicon.svg',

  // Set the production url of your site here
  url: 'https://magnusmagi.github.io',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/MonzieAI/',

  // GitHub pages deployment config.
  organizationName: 'MagnusMagi', // Usually your GitHub org/user name.
  projectName: 'MonzieAI', // Usually your repo name.
  deploymentBranch: 'gh-pages',
  trailingSlash: false,

  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internalization, you can use this field to set useful
  // metadata like html lang. For example, if your site is Chinese, you may want
  // to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          // Remove this to remove the "edit this page" links.
          editUrl: 'https://github.com/magnusmagi/monzieai/tree/main/website/',
        },
        blog: {
          showReadingTime: true,
          editUrl: 'https://github.com/magnusmagi/monzieai/tree/main/website/',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // Replace with your project's social card
      image: 'img/monzieai-social-card.jpg',
      navbar: {
        title: 'MonzieAI',
        logo: {
          alt: 'MonzieAI Logo',
          src: 'img/logo.svg',
        },
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'tutorialSidebar',
            position: 'left',
            label: 'Documentation',
          },
          {
            to: '/docs/api',
            label: 'API',
            position: 'left',
          },
          {
            to: '/docs/setup',
            label: 'Setup',
            position: 'left',
          },
          {
            href: 'https://github.com/magnusmagi/monzieai',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Documentation',
            items: [
              {
                label: 'Getting Started',
                to: '/docs/setup',
              },
              {
                label: 'Architecture',
                to: '/docs/architecture',
              },
              {
                label: 'API Reference',
                to: '/docs/api',
              },
            ],
          },
          {
            title: 'Development',
            items: [
              {
                label: 'Contributing',
                to: '/docs/contributing',
              },
              {
                label: 'Testing',
                to: '/docs/testing',
              },
              {
                label: 'Troubleshooting',
                to: '/docs/troubleshooting',
              },
            ],
          },
          {
            title: 'More',
            items: [
              {
                label: 'GitHub',
                href: 'https://github.com/magnusmagi/monzieai',
              },
              {
                label: 'Security',
                to: '/docs/security',
              },
              {
                label: 'Changelog',
                to: '/docs/changelog',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} MonzieAI. Built with Docusaurus.`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
        additionalLanguages: ['bash', 'json', 'typescript', 'javascript', 'jsx', 'tsx', 'sql'],
      },
      algolia: {
        // The application ID provided by Algolia
        appId: 'YOUR_APP_ID',
        // Public API key: it is safe to commit it
        apiKey: 'YOUR_SEARCH_API_KEY',
        indexName: 'monzieai',
        // Optional: see doc section below
        contextualSearch: true,
        // Optional: Algolia search parameters
        searchParameters: {},
        // Optional: path for search page that enabled by default (`false` to disable it)
        searchPagePath: 'search',
      },
      colorMode: {
        defaultMode: 'light',
        disableSwitch: false,
        respectPrefersColorScheme: true,
      },
      metadata: [
        {
          name: 'keywords',
          content: 'monzieai, ai, photo enhancement, react native, expo, documentation',
        },
        {
          name: 'description',
          content: 'MonzieAI - AI-powered photo enhancement and social platform documentation',
        },
      ],
    }),
};

module.exports = config;
