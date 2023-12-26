
export const fetcher = <T>(method: 'POST'|'GET', url: string, body: {[key: string]: any} = {}) => fetch(
  url,
  {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: method === 'POST' 
      ? JSON.stringify(body)
      : null
  }
).then((res) => res.json() as T);