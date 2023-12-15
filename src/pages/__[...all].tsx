import { LoaderProvider } from '@/context/LoaderContext';
import { Web3Provider } from '@/context/Web3Context';
import dynamic from 'next/dynamic';

const App = dynamic(() => import('../components/AppShell'), {
  ssr: false,
});

export default function Index() {
  return <Web3Provider>
            <LoaderProvider>
              <App />
            </LoaderProvider>
          </Web3Provider>;
}
