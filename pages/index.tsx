import Head from "next/head";
import Link from 'next/link'

export default function Home() {

  return (
    <>   
      <Head>
        <title>Talk-with-us</title>
      </Head>      
        <div className="flex h-full w-full flex-col justify-center">
          <div className="my-8">
            <h1 className="text-center text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-extrabold text-panda">
              <svg>
                <text x="50%" y="50%" dy=".35em">
                  Talk With Us
                </text>
              </svg>
            </h1>
          </div>
          <div className="flex flex-col justify-center max-lg:items-center lg:flex-row">
            <div className="m-4 flex flex-col justify-between lg:flex-row">
              <Link href="/samay">
                <button className="button button2 rounded-lg p-4 mt-2 lg:mt-0 lg:mr-6">
                  <span style={{ width: "150px", display: "inline-block" }}>
                    Talk with Samay
                  </span>
                </button>
              </Link>
              <Link href="/pavan">
                <button className="button button2 rounded-lg p-4 mt-2 lg:mt-0">
                  <span style={{ width: "150px", display: "inline-block" }}>
                    Talk with Pavan
                  </span>
                </button>
              </Link>
            </div>
          </div>
        </div>  
      </>        
  );
}