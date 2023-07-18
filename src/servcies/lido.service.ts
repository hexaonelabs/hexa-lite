
export const getBaseAPRstETH = async () => {
    const response = await fetch('https://eth-api.lido.fi/v1/protocol/steth/apr/last');
    const {data} = await response.json();
    return data as {apr: number};
};