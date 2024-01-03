import dynamic from 'next/dynamic';

export const App = dynamic(() => import('../components/AppShell'), {
  ssr: false,
});

export default function Index() {
  return <App />
}
