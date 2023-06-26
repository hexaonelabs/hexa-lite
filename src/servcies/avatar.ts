
export const getAvatarFromEVMAddress = async (evmAddress?: string, theme: 'jazzicons'|'blockies' = 'blockies'):Promise<string> =>  {
  if (!evmAddress) {
    return '';
  }
  if (theme === 'jazzicons') {
    // return import('@metamask/jazzicon').then(jazzicon => jazzicon.default( 97, value ));
    throw 'Not implemented';
  } else {
    const base64Img = await import('ethereum-blockies-base64').then(blockies => blockies.default(evmAddress));
    // convert base64 blob to create to local url 
    const blob = await fetch(base64Img).then(r => r.blob());
    const url = URL.createObjectURL(blob);
    return url;

  }    
}