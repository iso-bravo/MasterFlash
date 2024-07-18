/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js,jsx,tsx,mdx}",
  "./src/*.{html,js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      screens: {
        'custom': '500px',
        '685':  '685px',
        '300': '300px',
        '400': '400px',
        '280': '280px',
      },
    },
  },
  plugins: [],
}