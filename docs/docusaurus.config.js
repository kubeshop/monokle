// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

const organizationName = 'kubeshop';
const projectName = 'monokle';

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Monokle Documentation',
  tagline:
    'Monokle streamlines the process of creating, analyzing, and deploying Kubernetes configurations by providing a unified visual tool for authoring YAML manifests, validating policies, and managing live clusters.  ',
  favicon: 'img/favicon.png',

  // Set the production url of your site here
  url: `https://${organizationName}.github.io`,
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  //baseUrl: `/${projectName}/`,
  baseUrl: `/`,
  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName, // Usually your GitHub org/user name.
  projectName, // Usually your repo name.

  onBrokenLinks: 'throw',
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
          routeBasePath: '/',
          sidebarPath: require.resolve('./sidebars.js'),
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl: `https://github.com/${organizationName}/${projectName}/tree/main/`,
        },
        blog: false,
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
      navbar: {
        logo: {
          alt: 'Monokle',
          src: 'img/NewMonokleLogoDark.svg',
          href: '/',
        },
        items: [
          {
            href: 'https://discord.gg/6zupCZFQbe',
            label: 'Discord',
            position: 'left',
          },
          {
            type: 'html',
            position: 'right',
            value: `<iframe src="https://ghbtns.com/github-btn.html?user=kubeshop&repo=monokle&type=star&count=true&color=dark" style='margin-top: 6px' frameborder="0" scrolling="0" width="110" height="20" title="GitHub"></iframe>`,
          },
          {
            type: 'search',
            position: 'left',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Community',
            items: [
              {
                label: 'Discord',
                href: 'https://discord.com/invite/6zupCZFQbe',
              },
              {
                label: 'Twitter',
                href: 'https://twitter.com/monokle_io',
              },
              {
                label: 'GitHub',
                href: 'https://github.com/kubeshop/monokle',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Kubeshop.`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
    }),
};

module.exports = config;
