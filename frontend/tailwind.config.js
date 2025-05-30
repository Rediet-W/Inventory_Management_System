/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{html,js,jsx}",
    "./public/index.html",
    "./src/components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        "custom-bg": "rgb(243, 249, 251)",
        "custom-blue": "#1E43FA",
      },
    },
  },
  plugins: [],
};
