import "../styles/globals.css";
import type { AppProps } from "next/app";
import { MoralisProvider } from "react-moralis";
import Layout from "../src/components/Layout";
import { QueryClient, QueryClientProvider } from "react-query";
import { useState, useEffect } from "react";
//instantiate the react query instance
const queryClient = new QueryClient();

function MyApp({ Component, pageProps }: AppProps) {
  //define moralis credentials
  const APP_ID = process.env.NEXT_PUBLIC_APPID;
  const SERVER_URL = process.env.NEXT_PUBLIC_SERVERURL;
  //lock variable to display the page only when the credentials are given
  let isServerInfo = APP_ID && SERVER_URL ? true : false;
  //workaround for hydratation errors, where the client differs from the server.
  const [showChild, setShowChild] = useState(false);

  useEffect(() => {
    setShowChild(true);
  }, []);

  if (!APP_ID || !SERVER_URL) {
    throw new Error(
      "Missing Moralis Application ID or Server URL. Make sure to set your .env file."
    );
  }

  if (!showChild) {
    return null;
  }
  if (isServerInfo) {
    return (
      <MoralisProvider serverUrl={SERVER_URL} appId={APP_ID}>
        <QueryClientProvider client={queryClient}>
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </QueryClientProvider>
      </MoralisProvider>
    );
  }
}

export default MyApp;
