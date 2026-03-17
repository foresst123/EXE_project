export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#111827",
        sand: "#f8f1e8",
        clay: "#c67c4e",
        moss: "#2f5d50",
        mist: "#e7e2da",
        tide: "#0f4c81",
        foam: "#eef6ff",
        ember: "#f08f45",
      },
      boxShadow: {
        card: "0 20px 40px rgba(17, 24, 39, 0.08)",
        float: "0 24px 60px rgba(15, 34, 56, 0.14)",
      },
      fontFamily: {
        display: ["Geist", "Manrope", "Helvetica", "Arial", "sans-serif"],
        body: ["Geist", "Manrope", "Helvetica", "Arial", "sans-serif"],
      },
    },
  },
  plugins: [],
};
