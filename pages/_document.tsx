import Document, { Html, Head, Main, NextScript, DocumentContext } from 'next/document';

class MyDocument extends Document {
	static async getInitialProps(ctx: DocumentContext) {
		const initialProps = await Document.getInitialProps(ctx);
		return { ...initialProps };
	}

	render() {
		const meta = {
			title: 'Victor Foster - UI Engineer',
			description: 'Victor Foster - UI Engineer',
			image: 'https://assets.vercel.com/image/upload/q_auto/front/vercel/dps.png',
		};

		return (
			<Html lang='en'>
				<Head>
					<meta name='robots' content='follow, index' />
					<meta name='description' content={meta.description} />
					<meta property='og:site_name' content={meta.title} />
					<meta property='og:description' content={meta.description} />
					<meta property='og:title' content={meta.title} />
					{/* <meta property='og:image' content={meta.image} />
					<meta name='twitter:card' content='summary_large_image' /> */}
					<meta name='twitter:title' content={meta.title} />
					<meta name='twitter:description' content={meta.description} />
					{/* <meta name='twitter:image' content={meta.image} /> */}
					<link
						href='https://fonts.googleapis.com/css2?family=Open+Sans&family=Vollkorn:wght@400;600&display=swap'
						rel='stylesheet'
					/>
				</Head>
				<body>
					<Main />
					<NextScript />
				</body>
			</Html>
		);
	}
}

export default MyDocument;
