module.exports = {
	env: {
		browser: true,
		commonjs: true,
		es2021: true,
		node: true,
		jest: true,
	},
	extends: [
		'eslint:recommended',
		'plugin:react/recommended',
		'plugin:react-hooks/recommended',
		'next/core-web-vitals',
	],
	parserOptions: {
		ecmaFeatures: {
			jsx: true,
		},
		ecmaVersion: 12,
		sourceType: 'module',
	},
	plugins: ['react'],
	rules: {
		// Disable strict rules for production build
		'no-console': 'off',
		'no-unused-vars': 'warn', 
		'react/jsx-sort-props': 'off',
		'sort-imports': 'off',
		'react/no-unescaped-entities': 'warn',
		'quotes': 'off',
		'curly': 'off',
		'no-undef': 'warn',
		// Keep essential rules
		'react/jsx-uses-react': 'off',
		'react/react-in-jsx-scope': 'off',
		'react/prop-types': 'off',
		'@next/next/no-page-custom-font': 'warn',
		'react-hooks/rules-of-hooks': 'error',
		'react-hooks/exhaustive-deps': 'warn',
	},
	settings: {
		react: {
			version: 'detect',
		},
	},
	ignorePatterns: [],
}
