// https://ota-meshi.github.io/eslint-plugin-astro/user-guide/
// https://github.com/prettier/eslint-config-prettier#installation
// https://typescript-eslint.io/packages/typescript-eslint/
import eslintPluginAstro from 'eslint-plugin-astro';
import eslintConfigPrettier from 'eslint-config-prettier/flat';
import tseslint from 'typescript-eslint';

export default [
	{ ignores: ['dist/', '.astro/'] },
	// Flat config only matches .js/.mjs/.cjs by default; include .ts so the rules below apply to it.
	{ files: ['**/*.ts'], languageOptions: { parser: tseslint.parser } },
	...eslintPluginAstro.configs.recommended,
	{
		rules: {
			'prefer-const': 'error',
		},
	},
	eslintConfigPrettier,
];
