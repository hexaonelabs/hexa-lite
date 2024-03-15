
export const getCoingeekoTokenId = async (symbol: string) => {
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
    const coin: {id?: string} = data.find((c: any) => c.symbol.toLowerCase() === symbol.toLowerCase());
    return coin?.id;
}