/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{html,js}", "./public/index.html"],
  theme: {
    extend: {
      colors: {
        "custom-bg": "rgb(243, 249, 251)",
      },
    },
  },
  plugins: [],
};
