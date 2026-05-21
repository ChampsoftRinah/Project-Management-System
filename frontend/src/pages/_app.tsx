import type { AppProps } from 'next/app';
import type { NextPage } from 'next';
import type { ReactNode } from 'react';
import { useRouter } from 'next/router';
import { AuthProvider } from '../context/AuthContext';
import GlobalLayout from '../components/GlobalLayout';
import '../styles/globals.css';

type NextPageWithAuth = NextPage & {
  authPage?: boolean;
};

type AppPropsWithAuth = AppProps & {
  Component: NextPageWithAuth;
};

export default function App({ Component, pageProps }: AppPropsWithAuth) {
  const router = useRouter();
  const isAuthPage = router.pathname.startsWith('/auth');

  const getLayout = (page: ReactNode) => {
    if (isAuthPage) {
      return page;
    }
    return <GlobalLayout>{page}</GlobalLayout>;
  };

  return <AuthProvider>{getLayout(<Component {...pageProps} />)}</AuthProvider>;
}
