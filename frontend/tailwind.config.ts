import type { Config } from 'tailwindcss'

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Legacy colors kept for format.ts compatibility
        moria: '#1A1A1A',
        'moria-card': '#2D3E50',
        mithril: '#A8A9AD',
        gondor: '#F5F5F0',
        shire: '#5A7C5C',
        rohirrim: '#D4AF37',
        flame: '#DC3545',
        // Erebor design system
        erebor: {
          bg: '#080a0d',
          surface: '#111418',
          surface2: '#191e26',
          surface3: '#222a35',
          border: '#2a3242',
          'border-mid': '#3a4458',
          'border-bright': '#4a5670',
          gold: '#c9a84c',
          'gold-bright': '#f0c860',
          'gold-dim': '#7a6228',
          mithril: '#8ab0d8',
          'mithril-dim': '#4a6a8a',
          credit: '#1e6e3c',
          'credit-dim': '#0e3a20',
          debit: '#a02828',
          'debit-dim': '#5c1616',
          ember: '#c44a10',
          parchment: '#e4dcc8',
          'parchment-dim': '#a89878',
          rune: '#5a6a7a',
        },
      },
      fontFamily: {
        'cinzel-deco': ['"Cinzel Decorative"', 'serif'],
        cinzel: ['Cinzel', 'serif'],
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        gold: '0 0 12px rgba(201,168,76,0.25)',
        'gold-sm': '0 0 6px rgba(201,168,76,0.15)',
        'inset-gold': 'inset 0 1px 0 rgba(201,168,76,0.2)',
      },
      keyframes: {
        goldPulse: {
          '0%, 100%': { boxShadow: '0 0 0px rgba(201,168,76,0)' },
          '50%': { boxShadow: '0 0 14px rgba(201,168,76,0.35)' },
        },
      },
      animation: {
        'gold-pulse': 'goldPulse 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
} satisfies Config
