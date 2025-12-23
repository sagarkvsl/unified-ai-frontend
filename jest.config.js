const nextJest = require('next/jest')

const createJestConfig = nextJest({
	// Provide the path to your Next.js app to load next.config.js and .env files in your test environment
	dir: './',
})

// Add any custom config to be passed to Jest
const customJestConfig = {
	setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
	moduleFileExtensions: ['js', 'jsx'],
	moduleNameMapper: {
		'\\.(css|less)$': '<rootDir>/tests/jest/__mocks__/styleMock.js',
		'\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
			'<rootDir>/tests/jest/__mocks__/fileMock.js',
		'^@/src/(.*)$': '<rootDir>/src/$1',
	},
	testEnvironment: 'jest-environment-jsdom',
	collectCoverageFrom: [
		'src/**/*.{js,jsx,ts,tsx}',
		'!**/node_modules/**',
		'!**/vendor/**',
	],
	// transform: {
	// 	'^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }],
	// },
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig)
