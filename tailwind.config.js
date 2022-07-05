module.exports = {
  important: true,
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {},
  },
  daisyui: {
    themes: [
      "business",
      {
        permacast: {
          primary: "#FFFF00",
          secondary: "#18181b",
        }
      }
    ]
  },
  plugins: [
    require("@tailwindcss/aspect-ratio"),
    require("@tailwindcss/typography"),
    require("@tailwindcss/line-clamp"),
    require("daisyui"),
  ],
};
