import 'nextra-theme-blog/style.css';
import '../styles/main.scss';

import React, { Component, useEffect } from 'react';
import type { AppProps, NextWebVitalsMetric } from 'next/app';
import Head from 'next/head';
import * as gtag from '../lib/gtag';
import { useRouter } from 'next/router';

function MyPersonalWebsite({ Component, pageProps }: AppProps) {
	const router = useRouter();
	useEffect(() => {
		const handleRouteChange = (url: string) => {
			gtag.pageview(url);
		};
		router.events.on('routeChangeComplete', handleRouteChange);
		return () => {
			router.events.off('routeChangeComplete', handleRouteChange);
		};
	}, [router.events]);

	return (
		<>
			<Component {...pageProps} />
			<Head>
				<link rel='alternate' type='application/rss+xml' title='RSS' href='/feed.xml' />
			</Head>
			<Component {...pageProps} />
		</>
	);
}

export function reportWebVitals(metric: NextWebVitalsMetric) {
	// Use `window.gtag` if you initialized Google Analytics as this example:
	// https://github.com/vercel/next.js/blob/canary/examples/with-google-analytics/pages/_document.js
	// window?.gtag('event', name, {
	// 	event_category: label === 'web-vital' ? 'Web Vitals' : 'Next.js custom metric',
	// 	value: Math.round(name === 'CLS' ? value * 1000 : value), // values must be integers
	// 	event_label: id, // id unique to current page load
	// 	non_interaction: true, // avoids affecting bounce rate.
	// });
	console.log(metric);
}

export default MyPersonalWebsite;
