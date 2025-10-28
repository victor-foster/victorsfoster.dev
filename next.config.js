const withNextra = require('nextra')({
	theme: 'nextra-theme-blog',
	themeConfig: './theme.config.jsx',
	cssModules: true,
	cssLoaderOptions: {
		importLoaders: 1,
		localIdentName: '[local]-[hash:base64:5]',
	},
	trailingSlash: true,
	// optional: add `unstable_staticImage: true` to enable Nextra's auto image import
});
module.exports = withNextra();
