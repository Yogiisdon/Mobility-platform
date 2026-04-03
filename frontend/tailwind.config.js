/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg:      '#080b12',
        surface: '#0f1320',
        card:    '#141928',
        card2:   '#1a2035',
        border:  '#1e2540',
        border2: '#252d4a',
        text:    '#d8dce8',
        muted:   '#5a6080',
        faint:   '#2a3050',
        accent:  '#00d4aa',
        purple:  '#7c6ef5',
        red:     '#f04060',
        amber:   '#f0a030',
        green:   '#30d880',
        blue:    '#3090f0',
        hot:     '#f03050',
        warm:    '#f07020',
        cool:    '#30d080',
        cold:    '#3090f0',
      },
      fontFamily: {
        sans:  ['"IBM Plex Sans"', 'sans-serif'],
        mono:  ['"IBM Plex Mono"', 'monospace'],
        display: ['"Syne"', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 2.5s cubic-bezier(0.4,0,0.6,1) infinite',
        'slide-in': 'slideIn .3s ease',
        'fade-up': 'fadeUp .4s ease',
      },
      keyframes: {
        slideIn: { from: { opacity: 0, transform: 'translateY(-8px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        fadeUp:  { from: { opacity: 0, transform: 'translateY(12px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
      }
    }
  },
  plugins: []
}
