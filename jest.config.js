module.exports = {
	roots: ["<rootDir>/src"],
	testEnvironment: "jsdom",
	setupFilesAfterEnv: ["<rootDir>/src/setupTests.js"],
	moduleFileExtensions: ["js", "jsx", "ts", "tsx", "json"],
	transform: {
		"^.+\\.[jt]sx?$": "babel-jest",
	},
	transformIgnorePatterns: ["/node_modules/(?!(axios)/)"],
	moduleNameMapper: {
		"\\.(css|less|sass|scss)$": "identity-obj-proxy",
		"\\.(gif|ttf|eot|svg|png|jpg|jpeg|webp)$": "<rootDir>/src/Testing/fileMock.js",
	},
};
