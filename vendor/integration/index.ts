import fs from 'node:fs';
import os from 'node:os';

import type { AstroConfig, AstroIntegration } from 'astro';

import { configBuilder } from './utils/config-builder';
import { loadConfig } from './utils/load-config';

export default ({ config: _themeConfig = 'src/config.yaml' } = {}): AstroIntegration => {
  let cfg: AstroConfig;
  return {
    hooks: {
      'astro:build:done': ({ logger }) => {
        const buildLogger = logger.fork('astrowind');
        buildLogger.info('Updating `robots.txt` with `sitemap-index.xml` ...');

        try {
          const outDir = cfg.outDir;
          const publicDir = cfg.publicDir;
          const sitemapName = 'sitemap-index.xml';
          const sitemapFile = new URL(sitemapName, outDir);
          const robotsTxtFile = new URL('robots.txt', publicDir);
          const robotsTxtFileInOut = new URL('robots.txt', outDir);

          const hasIntegration =
            Array.isArray(cfg?.integrations) &&
            cfg.integrations?.find((e) => e?.name === '@astrojs/sitemap') !== undefined;
          const sitemapExists = fs.existsSync(sitemapFile);

          if (hasIntegration && sitemapExists) {
            const robotsTxt = fs.readFileSync(robotsTxtFile, { encoding: 'utf8', flag: 'a+' });
            const sitemapUrl = new URL(sitemapName, String(new URL(cfg.base, cfg.site)));
            const pattern = /^Sitemap:(.*)$/m;

            if (!pattern.test(robotsTxt)) {
              fs.appendFileSync(robotsTxtFileInOut, `${os.EOL}${os.EOL}Sitemap: ${sitemapUrl.toString()}`, {
                encoding: 'utf8',
                flag: 'w'
              });
            } else {
              fs.writeFileSync(robotsTxtFileInOut, robotsTxt.replace(pattern, `Sitemap: ${sitemapUrl.toString()}`), {
                encoding: 'utf8',
                flag: 'w'
              });
            }
          }
        } catch (_err) {
          /* empty */
        }
      },
      'astro:config:done': ({ config }) => {
        cfg = config;
      },

      'astro:config:setup': async ({
        addWatchFile,
        // injectRoute,
        // command,
        config,
        // isRestart,
        logger,
        updateConfig
      }) => {
        const buildLogger = logger.fork('astrowind');

        const virtualModuleId = 'astrowind:config';
        const resolvedVirtualModuleId = '\0' + virtualModuleId;

        const rawJsonConfig = await loadConfig(_themeConfig);
        // @ts-expect-error - this is a potential error as this can return a string
        const { ANALYTICS, APP_BLOG, I18N, METADATA, SITE, UI } = configBuilder(rawJsonConfig);

        updateConfig({
          base: SITE.base,
          site: SITE.site,

          trailingSlash: SITE.trailingSlash ? 'always' : 'never',

          vite: {
            plugins: [
              {
                load(id) {
                  if (id !== resolvedVirtualModuleId) {
                    return;
                  }
                  return `
                  export const SITE = ${JSON.stringify(SITE)};
                  export const I18N = ${JSON.stringify(I18N)};
                  export const METADATA = ${JSON.stringify(METADATA)};
                  export const APP_BLOG = ${JSON.stringify(APP_BLOG)};
                  export const UI = ${JSON.stringify(UI)};
                  export const ANALYTICS = ${JSON.stringify(ANALYTICS)};
                  `;
                },
                name: 'vite-plugin-astrowind-config',
                resolveId(id) {
                  if (id !== virtualModuleId) {
                    return;
                  }
                  return resolvedVirtualModuleId;
                }
              }
            ]
          }
        });

        if (typeof _themeConfig === 'string') {
          addWatchFile(new URL(_themeConfig, config.root));

          buildLogger.info(`Astrowind \`${_themeConfig}\` has been loaded.`);
        } else {
          buildLogger.info(`Astrowind config has been loaded.`);
        }
      }
    },

    name: 'astrowind-integration'
  };
};
