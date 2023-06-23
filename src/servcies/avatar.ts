
export const getAvatarFromEVMAddress = async (evmAddress?: string, theme: 'jazzicons'|'blockies' = 'blockies'):Promise<string> =>  {
  if (!evmAddress) {
    return '';
  }
  if (theme === 'jazzicons') {
    // return import('@metamask/jazzicon').then(jazzicon => jazzicon.default( 97, value ));
    throw 'Not implemented';
  } else {
    return import('ethereum-blockies-base64').then(blockies => blockies.default(evmAddress));
  }    
}