import { useRouter } from 'next/router';

const YEAR = new Date().getFullYear();

function Head({ title, meta }) {

	const router = useRouter();
	const siteUrl = 'https://victorfoster.dev';

	const pageTitle = title;
	const pageDescription = meta?.description || meta?.summary || 'Victor Foster - UI Engineer';
	const canonicalUrl = `${siteUrl}${router.asPath}`;
	const ogImage = meta?.image || `${siteUrl}/og-image.png`;

	return (
		<>
			<meta property='og:type' content='website' />
			<meta property='og:url' content={canonicalUrl} />
			<meta property='og:title' content={pageTitle} />
			<meta property='og:description' content={pageDescription} />
			<meta property='og:site_name' content='Victor Foster - UI Engineer' />
			<meta property='og:image' content={ogImage} />
			<meta property='og:image:width' content='1200' />
			<meta property='og:image:height' content='630' />
			<meta property='og:image:alt' content={pageTitle} />

			{/* Twitter Card tags */}
			<meta name='twitter:card' content='summary_large_image' />
			<meta name='twitter:title' content={pageTitle} />
			<meta name='twitter:description' content={pageDescription} />
			<meta name='twitter:image' content={ogImage} />
			<meta name='twitter:image:alt' content={pageTitle} />

			{/* Canonical URL */}
			<link rel='canonical' href={canonicalUrl} />
		</>
	);
}

const myBlogTheme = {
	head: Head,
	footer: (
		<footer>
			{/* <dl>
				<dt>Twitter</dt>
				<dd>[@victor_foster](https://twitter.com/victor_foster)</dd>
				<dt>GitHub</dt>
				<dd>[@victor-foster](https://github.com/victor-foster)</dd>
				<dt>Email</dt>
				<dd>[victor.foster@gmail.com](mailto:victor.foster@gmail.com)</dd>
			</dl> */}
		</footer>
	),
  darkMode: true,
};

export default myBlogTheme;
