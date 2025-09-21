import type { Config } from 'tailwindcss';

export default {
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-geist)', 'var(--font-montserrat)', 'var(--font-roboto)', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
    },
  },
} satisfies Config;
