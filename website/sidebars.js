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
        {
          type: 'doc',
          id: 'setup',
          label: '⚙️ Setup',
        },
        {
          type: 'doc',
          id: 'deployment',
          label: '🌐 Deployment',
        },
      ],
    },
    {
      type: 'category',
      label: '🏗️ Architecture',
      collapsed: false,
      items: [
        {
          type: 'doc',
          id: 'architecture',
          label: '📐 Overview',
        },
        {
          type: 'doc',
          id: 'database',
          label: '🗄️ Database',
        },
        {
          type: 'doc',
          id: 'services',
          label: '⚡ Services',
        },
        {
          type: 'doc',
          id: 'components',
          label: '🧩 Components',
        },
      ],
    },
    {
      type: 'category',
      label: '📱 Features & Screens',
      collapsed: true,
      items: [
        {
          type: 'doc',
          id: 'features',
          label: '✨ Features',
        },
        {
          type: 'doc',
          id: 'screens',
          label: '📲 Screens',
        },
      ],
    },
    {
      type: 'category',
      label: '🔌 API Reference',
      collapsed: true,
      items: [
        {
          type: 'doc',
          id: 'api',
          label: '📡 API Docs',
        },
      ],
    },
    {
      type: 'category',
      label: '🧪 Testing & Quality',
      collapsed: true,
      items: [
        {
          type: 'doc',
          id: 'testing',
          label: '🔬 Testing',
        },
        {
          type: 'doc',
          id: 'troubleshooting',
          label: '🔧 Troubleshooting',
        },
      ],
    },
    {
      type: 'category',
      label: '🎨 Design & UX',
      collapsed: true,
      items: [
        {
          type: 'doc',
          id: 'design-system',
          label: '🎭 Design System',
        },
      ],
    },
    {
      type: 'category',
      label: '🤝 Contributing',
      collapsed: true,
      items: [
        {
          type: 'doc',
          id: 'contributing',
          label: '💡 Guide',
        },
        {
          type: 'doc',
          id: 'security',
          label: '🔒 Security',
        },
        {
          type: 'doc',
          id: 'changelog',
          label: '📋 Changelog',
        },
      ],
    },
  ],
};

module.exports = sidebars;
