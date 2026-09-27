// https://ota-meshi.github.io/eslint-plugin-astro/user-guide/
// https://github.com/prettier/eslint-config-prettier#installation
import eslintPluginAstro from 'eslint-plugin-astro';
import eslintConfigPrettier from 'eslint-config-prettier/flat';

export default [
	{ ignores: ['dist/', '.astro/'] },
	...eslintPluginAstro.configs.recommended,
	{
		rules: {
			'prefer-const': 'error',
		},
	},
	eslintConfigPrettier,
];
