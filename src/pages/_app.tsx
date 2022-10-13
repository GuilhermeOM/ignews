import { AppProps } from "next/app";
import { Header } from "../components/Header/index";
import { SessionProvider } from "next-auth/react";

import Link from "next/link";
import { PrismicPreview } from "@prismicio/next";
import { repositoryName } from "../services/prismic";

import "../styles/global.scss";
import { PrismicProvider } from "@prismicio/react";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <SessionProvider session={pageProps.session}>
      <PrismicProvider
        internalLinkComponent={({ href, ...props }) => (
          <Link href={href}>
            <a {...props} />
          </Link>
        )}
      >
        <Header />
        <PrismicPreview repositoryName={repositoryName}>
          <Component {...pageProps} />
        </PrismicPreview>
      </PrismicProvider>
    </SessionProvider>
  );
}

export default MyApp;
