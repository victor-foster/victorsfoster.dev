const withBundleAnalyzer = require('@next/bundle-analyzer')({
	enabled: process.env.ANALYZE === 'true',
});

const withPurgeCss = require('next-purgecss');

const withNextra = require('nextra')('nextra-theme-blog', './theme.config.js');

module.exports = withPurgeCss(withBundleAnalyzer(withNextra()));
