
export const getTokenHistoryPrice = async (symbol: string) => {
  // convert symbol to coingeeko id
  const responseList = localStorage.getItem('hexa-lite-coingeeko/coinList');
  let data;
  if (responseList) {
    data = JSON.parse(responseList);
  } else {
    const fetchResponse = await fetch(`https://api.coingecko.com/api/v3/coins/list`);
    data = await fetchResponse.json();
    localStorage.setItem('hexa-lite-coingeeko/coinList', JSON.stringify(data));
  }
  const coin = data.find((c: any) => c.symbol.toLowerCase() === symbol.toLowerCase());
  if (!coin) return [];

  const responseToken = localStorage.getItem(`hexa-lite-coingeeko/coin/${coin.id}/market_chart`);
  const jsonData = JSON.parse(responseToken||'{}');
  const isDeadlineReach = (Date.now() - jsonData.timestamp) > (60 * 1000 * 30);
  let tokenMarketData;
  if (responseToken && !isDeadlineReach && jsonData.data) {
    tokenMarketData = jsonData.data;
  } else {
    const url = `https://api.coingecko.com/api/v3/coins/${coin.id}/market_chart?vs_currency=usd&days=30&interval=daily`;
    const res = await fetch(url);
    const result = await res.json();
    tokenMarketData = result?.prices as number[]||[];
    localStorage.setItem(`hexa-lite-coingeeko/coin/${coin.id}/market_chart`, JSON.stringify({
      data: tokenMarketData,
      timestamp: Date.now()
    }));
  }
  return tokenMarketData;
}