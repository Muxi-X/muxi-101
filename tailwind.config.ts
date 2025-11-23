import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      keyframes: {
        leftCloud: {
          '100%': {
            transform: 'translateX(calc(336 / 1280 * 100vw))',
          },
        },
        rightCloud: {
          '100%': {
            transform: 'translateX(calc(-50 / 1280 * 100vw))',
          },
        },
      },
      animation: {
        leftCloud: 'leftCloud 1s cubic-bezier(0.175, 0.885, 0.32, 1.275) 0s forwards',
        rightCloud: 'rightCloud 1s cubic-bezier(0.175, 0.885, 0.32, 1.275) 0s forwards',
      },
    },
  },
  plugins: [],
}

export default config 