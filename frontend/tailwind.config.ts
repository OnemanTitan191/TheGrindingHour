import type { Config } from 'tailwindcss'

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        moria: '#1A1A1A',
        'moria-card': '#2D3E50',
        mithril: '#A8A9AD',
        gondor: '#F5F5F0',
        shire: '#5A7C5C',
        rohirrim: '#D4AF37',
        flame: '#DC3545',
      },
      fontFamily: {
        cinzel: ['Cinzel', 'serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
} satisfies Config
