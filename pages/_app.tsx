import type { AppProps } from 'next/app';
import Head from 'next/head';
import Script from 'next/script';
import 'sanitize.css';
import 'nextra-theme-blog/style.css';
import '../styles/main.scss';

export default function App({ Component, pageProps }: AppProps) {
	// Get the page title and summary from frontmatter (available in pageProps with Nextra)
	const pageTitle = pageProps.title || 'Victor Foster - UI Engineer';
	const pageDescription = pageProps.summary || 'Victor Foster - UI Engineer';

	return (
		<>
			<Head>
        <link rel='alternate' type='application/rss+xml' title='RSS' href='/feed.xml' />

				<title>{pageTitle}</title>
				<meta name='description' content={pageDescription} />
				<meta property='og:title' content={pageTitle} />
				<meta property='og:description' content={pageDescription} />
				<meta property='og:site_name' content='Victor Foster - UI Engineer' />
				<meta name='twitter:title' content={pageTitle} />
				<meta name='twitter:description' content={pageDescription} />
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
