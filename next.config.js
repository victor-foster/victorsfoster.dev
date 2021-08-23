const withBundleAnalyzer = require('@next/bundle-analyzer')({
	enabled: process.env.ANALYZE === 'true',
});

const withNextra = require('nextra')('nextra-theme-blog', './theme.config.js');

module.exports = withBundleAnalyzer(withNextra());
