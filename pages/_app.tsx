import 'sanitize.css';
import 'nextra-theme-blog/style.css';
import '../styles/main.scss';

import React, { Component, useEffect } from 'react';
import type { AppProps, NextWebVitalsMetric } from 'next/app';
import Head from 'next/head';
import Script from 'next/script';

function MyPersonalWebsite({ Component, pageProps }: AppProps) {
	return (
		<>
			<Head>
				<link rel='alternate' type='application/rss+xml' title='RSS' href='/feed.xml' />
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

export default MyPersonalWebsite;
