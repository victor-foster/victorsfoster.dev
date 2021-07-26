import 'nextra-theme-blog/style.css'

import Head from 'next/head'

import 'sanitize.css';
import '../styles/main.css'

export default function Nextra({ Component, pageProps }) {
  return (
    <>
      <Head>
        <link
          rel="alternate"
          type="application/rss+xml"
          title="RSS"
          href="/feed.xml"
        />
         <link
          href="https://fonts.googleapis.com/css2?family=Open+Sans&family=Vollkorn:wght@400;600"
          rel="stylesheet"
        />
      </Head>
      <Component {...pageProps} />
    </>
  )
}
