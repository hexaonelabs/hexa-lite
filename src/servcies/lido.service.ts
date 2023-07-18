
export const getBaseAPRstETH = async (signal?: AbortSignal) => {
    const response = await fetch('https://eth-api.lido.fi/v1/protocol/steth/apr/last', {signal});
    const {data} = await response.json();
    return data as {apr: number};
};