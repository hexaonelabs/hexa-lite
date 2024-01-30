import { addUTM } from '@/servcies/datas.service';
import { getUtmAsObject, haveUtm } from '@/utils/utm';
import dynamic from 'next/dynamic';
import { useEffect } from 'react';

export const App = dynamic(() => import('../components/AppShell'), {
  ssr: false,
});

export default function Index() {
  // add utm traking
  useEffect(()=> {
    const url = window.location.href;
    if (!haveUtm(url)) {
      return;
    }
    // get utm object ready
    const utmData = getUtmAsObject(url);
    // save to db
    addUTM(utmData)
    .then((response) => {
      console.log(response);
    });
  }, []);
  return <App />
}
