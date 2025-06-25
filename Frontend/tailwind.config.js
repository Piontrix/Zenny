/** @type {import('tailwindcss').Config} */
export default {
	content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
	theme: {
		extend: {
			colors: {
				zenny: {
					light: "#fff0f3", // soft peach background
					primary: "#fce5ec", // very light pink
					accent: "#e94b7b", // hot pink
					dark: "#b03060", // deep rose
					highlight: "#f59e0b",
					text: "#3e3e3e", // dark text
					border: "#f7cad0", // light pink border
				},
			},
			fontFamily: {
				sans: ["Inter", "sans-serif"],
				heading: ['"Playfair Display"', "serif"], // Optional fancy font
			},
		},
	},
	plugins: [],
};
