// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

import {themes as prismThemes} from 'prism-react-renderer';

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Deep Chat',
  tagline: 'Customizable chat component for AI APIs',
  url: 'https://deepchat.dev',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.png',
  onBrokenAnchors: 'ignore',

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
        {name: 'description', content: 'Customizable chat component for AI APIs'},
        {name: 'keywords', content: 'ai, chat, bot, chatbot, assistant, component'},
        {name: 'og:title', content: 'Deep Chat'},
        {name: 'og:description', content: 'Customizable chat component for AI APIs'},
        {
          name: 'og:image',
          content: 'https://raw.githubusercontent.com/OvidijusParsiunas/deep-chat/main/assets/readme/social-media-4.png',
        },
        {name: 'og:url', content: 'https://deepchat.dev/'},
        {name: 'twitter:title', content: 'Deep Chat'},
        {name: 'twitter:card', content: 'summary_large_image'},
        {name: 'twitter:site', content: '@deepchat'},
        {name: 'twitter:description', content: 'Customizable chat component for AI APIs'},
        {
          name: 'twitter:image',
          content: 'https://raw.githubusercontent.com/OvidijusParsiunas/deep-chat/main/assets/readme/social-media-4.png',
        },
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
            to: 'start',
            position: 'left',
            label: 'Start',
          },
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
            to: 'playground',
            position: 'left',
            label: 'Playground',
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
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
      },
      algolia: {
        appId: 'R9MZ0HQPWJ',
        apiKey: 'b86f7a2cbd4f547d926b48432455a217',
        indexName: 'deepchat',
      },
    }),
  // this is used to prevent the website font changing after it is rendered
  // https://github.com/OvidijusParsiunas/deep-chat/issues/3
  // the strategy is to preload the font-faces and their sources, additionally each one will need a 'preload' and 'stylesheet'
  // rel attribute as 'preload' by itself does not apply the stylesheet
  headTags: [
    // The following is used to prevent the component styling from rendering too late
    // https://fonts.gstatic.com/s/inter/v12/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2 appears to be the only font used immediately
    {
      tagName: 'link',
      attributes: {
        rel: 'preload',
        href: 'https://fonts.gstatic.com/s/inter/v12/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2',
        as: 'font',
        type: 'font/woff2',
      },
    },
    {
      tagName: 'link',
      attributes: {
        rel: 'stylesheet',
        href: 'https://fonts.gstatic.com/s/inter/v12/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2',
        as: 'font',
        type: 'font/woff2',
      },
    },
    {
      tagName: 'link',
      attributes: {
        rel: 'preload',
        href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap',
        as: 'style',
      },
    },
    {
      tagName: 'link',
      attributes: {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap',
        as: 'style',
      },
    },
    // The following is used to prevent site's 'inter_webfont' font-family from rendering too late
    {
      tagName: 'link',
      attributes: {
        rel: 'preload',
        href: '/fonts/inter.woff2',
        as: 'font',
        type: 'font/woff2',
      },
    },
    {
      tagName: 'link',
      attributes: {
        rel: 'stylesheet',
        href: '/fonts/inter.woff2',
        as: 'font',
        type: 'font/woff2',
      },
    },
    {
      tagName: 'link',
      attributes: {
        rel: 'preload',
        href: '/fonts/inter-webfont.css',
        as: 'style',
      },
    },
    {
      tagName: 'link',
      attributes: {
        rel: 'stylesheet',
        href: '/fonts/inter-webfont.css',
        as: 'style',
      },
    },
  ],
};

module.exports = config;
