// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Deep Chat',
  tagline: 'Fully customizable chat component that can connect to any service',
  url: 'https://deepchat.dev',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.png',

  // GitHub pages deployment config
  organizationName: 'OvidijusParsiunas', // GitHub org/user name
  projectName: 'deep-chat', // repo name

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
          // Used for the "edit this page" links.
          editUrl: 'https://github.com/OvidijusParsiunas/deep-chat/tree/main/website',
          sidebarPath: 'sidebars.js',
          routeBasePath: '/',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],
  plugins: [
    () => ({
      name: 'custom-webpack-config',
      configureWebpack: () => {
        return {
          module: {
            rules: [
              {
                test: /\.m?js/,
                resolve: {
                  fullySpecified: false,
                },
              },
            ],
          },
        };
      },
    }),
  ],
  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      metadata: [
        {name: 'description', content: 'Framework agnostic table component for editable data experience'},
        {name: 'keywords', content: 'table, grid, edit, component, javascript'},
        {name: 'og:title', content: 'Active Table'},
        {name: 'og:description', content: 'Framework agnostic table component for editable data experience'},
        {name: 'og:url', content: 'https://activetable.io/'},
        {name: 'twitter:title', content: 'Active Table'},
        {name: 'twitter:description', content: 'Framework agnostic table component for editable data experience'},
      ],
      navbar: {
        title: 'Deep Chat',
        logo: {
          alt: 'Deep Chat img',
          src: 'img/deep-chat-title.svg',
          width: 31,
          height: 31,
        },
        items: [
          {
            type: 'docSidebar',
            position: 'left',
            label: 'Docs',
            sidebarId: 'docs',
          },
          {
            type: 'docSidebar',
            position: 'left',
            label: 'Examples',
            sidebarId: 'examples',
          },
          {
            href: 'https://github.com/OvidijusParsiunas/deep-chat',
            position: 'right',
            className: 'header-github-link',
            'aria-label': 'GitHub repository',
          },
        ],
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
      algolia: {
        appId: 'R9MZ0HQPWJ',
        apiKey: 'b86f7a2cbd4f547d926b48432455a217',
        indexName: 'deepchat',
      },
    }),
};

module.exports = config;
