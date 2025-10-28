import type { AppProps } from 'next/app';
import Head from 'next/head';
import Script from 'next/script';
import { useRouter } from 'next/router';
import 'sanitize.css';
import 'nextra-theme-blog/style.css';
import '../styles/main.scss';

export default function App({ Component, pageProps }: AppProps) {
	const router = useRouter();

	// get the page title and summary from pageProps with Nextra
	const pageTitle = pageProps.title || 'Victor Foster - UI Engineer';
	const pageDescription = pageProps.summary || 'Victor Foster - UI Engineer';

	const siteUrl = 'https://victorfoster.dev';
	const canonicalUrl = `${siteUrl}${router.asPath}`;

	const ogImage = pageProps.image || `${siteUrl}/og-image.png`;

	return (
		<>
			<Head>
				<link rel='alternate' type='application/rss+xml' title='RSS' href='/feed.xml' />

				<title>{pageTitle}</title>
				<meta name='description' content={pageDescription} />

				<meta property='og:type' content='website' />
				<meta property='og:url' content={canonicalUrl} />
				<meta property='og:title' content={pageTitle} />
				<meta property='og:description' content={pageDescription} />
				<meta property='og:site_name' content='Victor Foster - UI Engineer' />
				<meta property='og:image' content={ogImage} />
				<meta property='og:image:width' content='1200' />
				<meta property='og:image:height' content='630' />
				<meta property='og:image:alt' content={pageTitle} />

				<meta name='twitter:card' content='summary_large_image' />
				<meta name='twitter:title' content={pageTitle} />
				<meta name='twitter:description' content={pageDescription} />
				<meta name='twitter:image' content={ogImage} />
				<meta name='twitter:image:alt' content={pageTitle} />

				<link rel='canonical' href={canonicalUrl} />

				<meta name='robots' content='follow, index' />
			</Head>

			<Script
				strategy='lazyOnload'
				src={`https://www.googletagmanager.com/gtag/js?id=UA-29309617-1`}
				id='google-tag-manager'
			/>
			<Script strategy='lazyOnload' id='google-tag-manager-data-layer'>
				{`
					window.dataLayer = window.dataLayer || [];
					function gtag(){dataLayer.push(arguments);}
					gtag('js', new Date());
					gtag('config', 'UA-29309617-1', {
						page_path: window.location.pathname,
					});
				`}
			</Script>
			<Component {...pageProps} />
		</>
	);
}
