import path from 'path';

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwind from '@astrojs/tailwind';
import { defineConfig, squooshImageService } from 'astro/config';
import compress from 'astro-compress';
import icon from 'astro-icon';

import {
  lazyImagesRehypePlugin,
  readingTimeRemarkPlugin,
  responsiveTablesRehypePlugin
} from './src/utils/frontmatter.mjs';
import astrowind from './vendor/integration';

export default defineConfig({
  image: {
    domains: ['cdn.pixabay.com'],
    service: squooshImageService()
  },
  integrations: [
    tailwind({
      applyBaseStyles: false
    }),
    sitemap(),
    mdx(),
    icon({
      include: {
        'flat-color-icons': [
          'template',
          'gallery',
          'approval',
          'document',
          'advertising',
          'currency-exchange',
          'voice-presentation',
          'business-contact',
          'database'
        ],
        tabler: ['*']
      }
    }),
    compress({
      CSS: true,
      HTML: {
        'html-minifier-terser': {
          removeAttributeQuotes: false
        }
      },
      Image: false,
      JavaScript: true,
      Logger: 1,
      SVG: false
    }),
    astrowind({
      config: './src/config.yaml'
    })
  ],
  markdown: {
    // @ts-expect-error - inherited js code
    rehypePlugins: [responsiveTablesRehypePlugin, lazyImagesRehypePlugin],
    remarkPlugins: [readingTimeRemarkPlugin]
  },
  output: 'static',
  vite: {
    resolve: {
      alias: {
        '~': path.resolve(import.meta.dirname, './src')
      }
    }
  }
});
