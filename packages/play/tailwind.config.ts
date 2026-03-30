import type { Config } from 'tailwindcss';
import tailwindcssAnimate from 'tailwindcss-animate';

export default {
  darkMode: ['class'],
  content: [
    './index.html',
    './src/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))'
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))'
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        }
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      },
      spacing: {
        'app-nav': 'var(--size-nav-menu)',
        'app-sidebar': 'var(--size-sidebar)',
        'app-card': 'var(--size-card)',
        'app-avatar': 'var(--size-avatar)',
        'app-profile-avatar': 'var(--size-profile-avatar)',
        'app-board-card': 'var(--size-board-card)',
        'app-energy': 'var(--size-energy)',
        'app-pad-sm': 'var(--padding-small)',
        'app-pad': 'var(--padding-normal)',
        'app-pad-lg': 'var(--padding-large)',
        'app-prompt': 'var(--prompt-padding)'
      },
      height: {
        'app-toolbar': 'var(--size-toolbar)',
        'app-toolbar-desktop': 'var(--size-toolbar-desktop)',
        'app-toolbar-mobile': 'var(--size-toolbar-mobile)'
      },
      width: {
        'app-nav': 'var(--size-nav-menu)'
      },
      maxHeight: {
        'app-prompt': 'var(--prompt-max-height)'
      },
      opacity: {
        disabled: 'var(--disabled-opacity)'
      },
      borderRadius: {
        'card-legacy': 'var(--card-border-radius)',
        'prompt-legacy': 'var(--prompt-border-radius)'
      }
    }
  },
  plugins: [tailwindcssAnimate]
} satisfies Config;
