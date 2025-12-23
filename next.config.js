/** @type {import('next').NextConfig} */

const nextConfig = {
	transpilePackages: [
		'@dtsl/react',
		'@dtsl/icons',
		'@dtsl/js-utils',
		'@dtsl/react-utils',
		'@dtsl/url-fetch',
	],
	async redirects() {
		return [
			{
				source: '/',
				destination: '/welcome',
				permanent: true,
			},
		]
	},
}

module.exports = nextConfig
