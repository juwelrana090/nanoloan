/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,tsx}', './components/**/*.{js,ts,tsx}', './shared/**/*.{js,ts,tsx}'],

  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Roboto_400Regular', 'sans-serif'],
        'space-mono': ['SpaceMono-Regular', 'monospace'],
        // Roboto font variants
        'roboto': ['Roboto_400Regular', 'sans-serif'],
        'roboto-light': ['Roboto_300Light', 'sans-serif'],
        'roboto-medium': ['Roboto_500Medium', 'sans-serif'],
        'roboto-bold': ['Roboto_700Bold', 'sans-serif'],
        'roboto-black': ['Roboto_900Black', 'sans-serif'],
        // Lilita One font variant
        'lilita-one': ['LilitaOne_400Regular', 'sans-serif'],
        // Inter font variants
        'inter': ['Inter_400Regular', 'sans-serif'],
        'inter-light': ['Inter_300Light', 'sans-serif'],
        'inter-medium': ['Inter_500Medium', 'sans-serif'],
        'inter-bold': ['Inter_700Bold', 'sans-serif'],
        'inter-black': ['Inter_900Black', 'sans-serif'],
        // Inter font variants italic
        'inter-italic': ['Inter_400Regular_Italic', 'sans-serif'],
        'inter-light-italic': ['Inter_300Light_Italic', 'sans-serif'],
        'inter-medium-italic': ['Inter_500Medium_Italic', 'sans-serif'],
        'inter-bold-italic': ['Inter_700Bold_Italic', 'sans-serif'],
        'inter-black-italic': ['Inter_900Black_Italic', 'sans-serif'],
        // Inter font variants extra light
        'inter-extra-light': ['Inter_200ExtraLight', 'sans-serif'],
        'inter-extra-light-italic': ['Inter_200ExtraLight_Italic', 'sans-serif'],
        // Inter font variants extra bold
        'inter-extra-bold': ['Inter_800ExtraBold', 'sans-serif'],
        'inter-extra-bold-italic': ['Inter_800ExtraBold_Italic', 'sans-serif'],
        // Inter font variants thin
        'inter-thin': ['Inter_100Thin', 'sans-serif'],
        'inter-thin-italic': ['Inter_100Thin_Italic', 'sans-serif'],
        // Inter font variants semi bold
        'inter-semi-bold': ['Inter_600SemiBold', 'sans-serif'],
        'inter-semi-bold-italic': ['Inter_600SemiBold_Italic', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
