import Navbar from "@/components/Navbar";
import BigRedButton from "@/components/ui/BigRedButton";
import RoundPort from "@/components/ui/RoundPort";
import Head from "next/head";

export default function Home() {

  return (
    <>
      <Navbar />
      <Head>
        <title>Talk-with-us</title>
      </Head>
      <RoundPort>
        <div className="flex h-full w-full flex-col justify-center">
          <div className="my-8">
            <h1 className="text-center text-2xl font-bold text-panda lg:text-3xl">
              Welcome to Talk With Us
            </h1>
          </div>
          <div className="flex flex-col justify-center max-lg:items-center lg:flex-row">
            {/* <Image
              src="/redpanda.png"
              width={221}
              height={232}
              alt="red panda sitting"
            /> */}
            <div className="m-4 flex flex-col justify-between">
              <BigRedButton>
                <a href="samay">
                  &nbsp;&nbsp;&nbsp;Talk with Samay&nbsp;&nbsp; &nbsp;{" "}
                </a>
              </BigRedButton>
              <div className="h-4"></div>
              <BigRedButton>
                <a href="pavan">
                  &nbsp;&nbsp;&nbsp;Talk with Pavan&nbsp;&nbsp; &nbsp;{" "}
                </a>
              </BigRedButton>
            </div>
          </div>
        </div>
      </RoundPort>
    </>
  );
}
