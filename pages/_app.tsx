import 'sanitize.css';
import 'nextra-theme-blog/style.css';
import '../styles/main.scss';

import React, { Component, useEffect } from 'react';
import type { AppProps, NextWebVitalsMetric } from 'next/app';
import Head from 'next/head';

function MyPersonalWebsite({ Component, pageProps }: AppProps) {
	return (
		<>
			<Head>
				<link rel='alternate' type='application/rss+xml' title='RSS' href='/feed.xml' />
			</Head>
			<Component {...pageProps} />
		</>
	);
}

export default MyPersonalWebsite;
