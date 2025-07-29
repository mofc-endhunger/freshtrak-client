/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
	theme: {
		extend: {
			colors: {
				primary: "#28CE85",
				secondary: "#392947",
				"text-primary": "#009F56",
				"content-text": "#616161",
				highlight: "#392947",
				"gray-light": "#F2F0F4",
				"gray-dark": "#424242",
				"gray-inner": "#e5e5e5",
				"switch-button": "#C4C4C4",
				"default-button": "#E9EAEB",
				"shadow-color": "#e6e6e6",
				"shadow-dark": "#b9b9b9",
				"color-red": "#dc3545",
				"color-light": "#282828",
				"color-light-grey": "#6A6B6B",
			},
			fontFamily: {
				"noto-sans": ["Noto Sans", "sans-serif"],
				varela: ["Varela Round", "sans-serif"],
			},
			spacing: {
				50: "50px",
				60: "60px",
				100: "100px",
				150: "150px",
				200: "200px",
			},
			animation: {
				"spin-slow": "spin 1.2s linear infinite",
			},
			borderWidth: {
				3: "3px",
				5: "5px",
			},
			minHeight: {
				25: "100px",
			},
			minWidth: {
				55: "220px",
			},
		},
	},
	plugins: [
		require("@tailwindcss/forms"),
		require("@tailwindcss/typography"),
	],
};
