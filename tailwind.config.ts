import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class", // Make sure this line is present
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // ... your theme extensions
    },
  },
  plugins: [],
};

export default config;