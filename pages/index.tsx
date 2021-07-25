import Head from 'next/head'
import Image from 'next/image'

export const Home = (): JSX.Element => (
  <div className="container">
    <Head>
      <title>Create Next App</title>
      <link rel="icon" href="/favicon.ico" />
    </Head>

    <main>
		<header>
		{/* <!-- */}
            <figure className="logo">
                <a href="http://victorfoster.com">Victor Foster</a>
             </figure>
            {/* --> */}
            <h2>
                <a href="http://victorfoster.com">Victor Foster</a>
            </h2>
             <p>
                 UI Developer for Inspirato Labs, the technical innovation division within Inspirato whose mission is to disrupt the status quo of travel technology.
                 {/* <!-- */}
                    Musician & recordist with the Language of Termites, Rockets in Reverse &     Purge City.  Not a Ninja.
                {/* --> */}
            </p>
            <a href="http://dev.victorfoster.com/feed">feed</a>
            <a href="http://twitter.com/victor_foster">twitter</a>

        </header>
        <div className="content">
            <article>
              <h1>Title</h1>
                <time dateTime="2013-03-25" >March 25th, 2013</time>
              <p>Hello world! <a href="google.com">Google</a></p>
            </article>
        </div>
    </main>

    {/* <footer>
      <a
        href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
        target="_blank"
        rel="noopener noreferrer"
      >
        Powered by{' '}
        <Image src="/vercel.svg" alt="Vercel Logo" height={'32'} width={'64'} />
      </a>
    </footer> */}

    <style jsx>{`
      * {
				-moz-box-sizing: border-box;
				-webkit-box-sizing: border-box;
				box-sizing: border-box;
			-webkit-transition: all 0.3s ease;
				-moz-transition:    all 0.2s ease;
				-o-transition:      all 0.2s ease;
			transition:      all 0.2s ease;
		}

		html {
				height: 100%;
				margin: 0;
				padding: 0;
		}

		body {
		 background-color: #ffffff;
			background-image: -webkit-gradient(linear, left top, left bottom, from(#ffffff), to(#E9F2F1));
			background-image: -webkit-linear-gradient(top, #ffffff, #E9F2F1);
			background-image:    -moz-linear-gradient(top, #ffffff, #E9F2F1);
			background-image:      -o-linear-gradient(top, #ffffff, #E9F2F1);
			background-image:         linear-gradient(to bottom, #ffffff, #E9F2F1);

			/*	http://callbackhell.com/
				*/
				color: #444;
				/*font-family: MuseoSans,Georgia,"Times New Roman",Times,serif;*/
			 font-family: "Open Sans","Helvetica Neue",Helvetica,Arial,sans-serif;
				font-size: 0.9em;
				height: 100%;
				line-height: 1.6;
				margin: 0.5em auto 0;
				max-width: 50em;
				overflow: auto;
				padding: 0.3em 2em;
		}

		header {
				float: right;
				width: 27%;
		}

		header h2 > a {
				float: none;
		}

		header p {
				margin: 1em 0 2.2em;
		}

		header a {
				clear: left;
				float: left;
		}

		.logo a {
				position: absolute;
				text-indent: -9999px;
		}

		.content {
				float: left;
				width: 73%;
		}

		h1 {
				font-size: 2.5em;
				line-height: 1.25em;
		}

		h1 + p {
				font-size: 1.25em;
				font-weight: 100;
		}

		a {
				color: #585B5B;
				text-decoration: none; border-bottom:1px dotted;
		}

		#posts {
				margin: auto;
				width: 25em;
		}
    `}</style>

    <style jsx global>{`
      html,
      body {
        padding: 0;
        margin: 0;
        font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen,
          Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;
      }

      * {
        box-sizing: border-box;
      }
    `}</style>
  </div>
)

export default Home
