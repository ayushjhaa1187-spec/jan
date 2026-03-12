import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#1a365d', light: '#2b6cb0' },
        success: '#276749',
        warning: '#b7791f',
        danger: '#c53030',
      },
    },
  },
  plugins: [],
}

export default config
