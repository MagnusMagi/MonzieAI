// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  // Main documentation sidebar
  tutorialSidebar: [
    {
      type: 'doc',
      id: 'intro',
      label: '👋 Introduction',
    },
    {
      type: 'category',
      label: '🚀 Getting Started',
      collapsed: false,
      items: [
        'setup',
        'deployment',
      ],
    },
    {
      type: 'category',
      label: '🏗️ Architecture',
      collapsed: false,
      items: [
        'architecture',
        'database',
        'services',
        'components',
      ],
    },
    {
      type: 'category',
      label: '📱 Features & Screens',
      collapsed: true,
      items: [
        'features',
        'screens',
      ],
    },
    {
      type: 'category',
      label: '🔌 API Reference',
      collapsed: true,
      items: [
        'api',
      ],
    },
    {
      type: 'category',
      label: '🧪 Testing & Quality',
      collapsed: true,
      items: [
        'testing',
        'troubleshooting',
      ],
    },
    {
      type: 'category',
      label: '🤝 Contributing',
      collapsed: true,
      items: [
        'contributing',
        'security',
        'changelog',
      ],
    },
  ],
};

module.exports = sidebars;
