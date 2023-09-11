import "@/styles/globals.css";
import '@/styles/chatStyles.scss';
import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
