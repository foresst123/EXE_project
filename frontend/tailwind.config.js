export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Main (red)
        main: "#ed0000",
        "main-light": "#f37f7f",
        "main-dark": "#a70000",
        "main-deep": "#600000",
        // 2nd (orange/yellow)
        second: "#ff7300",
        "second-alt": "#ffad00",
        // Text (gray scale)
        text: "#3b3b3d",
        "text-soft": "#b8b8bb",
        "text-strong": "#1f2024",
        // Backward compatible aliases used across current UI
        ink: "#1f2024",
        sand: "#f3f3f3",
        clay: "#ed0000",
        moss: "#ff7300",
        mist: "#d6d6d8",
        tide: "#a70000",
        foam: "#f8f8f8",
        ember: "#ffad00",
      },
      boxShadow: {
        card: "0 20px 40px rgba(31, 32, 36, 0.12)",
        float: "0 24px 60px rgba(97, 0, 0, 0.2)",
      },
      fontFamily: {
        display: ["Geist", "Manrope", "Helvetica", "Arial", "sans-serif"],
        body: ["Geist", "Manrope", "Helvetica", "Arial", "sans-serif"],
      },
    },
  },
  plugins: [],
};
