/**
 * Generate a browser fingerprint
 * @returns {string} browser fingerprint
 */
const generateBrowserFingerprint = () => {
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl');
  if (!gl) return 'no webgl';
  const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
  if (!debugInfo) return 'no webgl debug info';
  const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
  const plugins = Array.from(navigator.plugins||[]).map(p => p?.name).join(',');
  const fp = [
      navigator.userAgent,
      navigator.language,
      navigator.platform||undefined,
      navigator.appVersion||undefined,        
      screen.height,
      screen.width,
      new Date().getTimezoneOffset(),
      navigator.cookieEnabled,
      renderer,
      plugins,
  ].join('|');
  return fp;
}

/**
 * Check if url has utm params
 * @param url String to check for utm params
 * @returns {boolean} true if url has utm params
 */
export const haveUtm = (url: string): boolean => {
  const utm = url.split('?utm_')[1]
  return !!utm
}

/**
 * 
 * @param url String to get utm params from
 * @returns {object} utm params as object with fingerprint included
 */
export const getUtmAsObject = (url: string):{[key: string]: string} => {
  const utm = url.split('?utm_')[1]
  const utmObject = utm.split('&').reduce((acc, item, i) => {
    const [key, value] = item.split('=');
    // create key without utm_ and store value
    const keyName = (i == 0) 
      ? key
      : key.split('utm_')[1];
    acc[keyName] = value;
    // return the updated acc
    return acc
  }, {} as {[key: string]: string});
  // add current user data from navigator to the utmObject
  utmObject['fp'] = generateBrowserFingerprint();
  // return the utmObject
  return utmObject
}
