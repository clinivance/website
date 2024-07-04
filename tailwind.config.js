import typographyPlugin from '@tailwindcss/typography';
import defaultTheme from 'tailwindcss/defaultTheme';

export default {
  content: ['./src/**/*.{astro,html,js,jsx,json,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: 'class',
  plugins: [typographyPlugin],
  theme: {
    extend: {
      colors: {
        accent: 'var(--aw-color-accent)',
        default: 'var(--aw-color-text-default)',
        muted: 'var(--aw-color-text-muted)',
        primary: 'var(--aw-color-primary)',
        secondary: 'var(--aw-color-secondary)'
      },
      fontFamily: {
        heading: ['var(--aw-font-heading, ui-sans-serif)', ...defaultTheme.fontFamily.sans],
        sans: ['var(--aw-font-sans, ui-sans-serif)', ...defaultTheme.fontFamily.sans],
        serif: ['var(--aw-font-serif, ui-serif)', ...defaultTheme.fontFamily.serif]
      }
    }
  }
};
