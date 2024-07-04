declare module 'astrowind:config' {
  export const SITE: import('./utils/config-builder').SiteConfig;
  export const I18N: import('./utils/config-builder').I18NConfig;
  export const METADATA: import('./utils/config-builder').MetaDataConfig;
  export const APP_BLOG: import('./utils/config-builder').AppBlogConfig;
  export const UI: import('./utils/config-builder').UIConfig;
  export const ANALYTICS: import('./utils/config-builder').AnalyticsConfig;
}
