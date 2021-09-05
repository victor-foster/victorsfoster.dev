const withBundleAnalyzer = require('@next/bundle-analyzer')({
	enabled: process.env.ANALYZE === 'true',
});

const withNextra = require('nextra')('nextra-theme-blog', './theme.config.js');

const path = require('path');
const withPlugins = require('next-compose-plugins');

const nextConfig = {
	cssModules: true,
	cssLoaderOptions: {
		importLoaders: 1,
		localIdentName: '[local]-[hash:base64:5]',
	},
	trailingSlash: true,
};
module.exports = withPlugins([withBundleAnalyzer, withNextra], nextConfig);
