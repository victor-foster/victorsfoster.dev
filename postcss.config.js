module.exports = {
	plugins: {
		'postcss-focus-visible': { replaceWith: '[data-focus-visible-added]' },
		'postcss-flexbugs-fixes': {},
		'postcss-preset-env': {
			autoprefixer: {
				flexbox: 'no-2009',
			},
			stage: 3,
			features: {
				'custom-properties': false,
			},
		},
	},
};
