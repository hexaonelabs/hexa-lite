export const getAssetIconUrl = ({ symbol }: { symbol: string }) => {
  let logoUrl =
    "./assets/cryptocurrency-icons/" + symbol?.toLowerCase() + ".svg";
  if (symbol === "WMATIC") {
    logoUrl = `./assets/icons/wmatic.svg`;
  }
  if (symbol === "aPolWMATIC") {
    logoUrl = `./assets/icons/awmatic.svg`;
  }
  if (symbol === "stMATIC") {
    logoUrl = `./assets/icons/stmatic.svg`;
  }
  if (symbol === "wstETH") {
    logoUrl = `./assets/icons/wsteth.svg`;
  }
  if (symbol === "stETH") {
    logoUrl = `./assets/icons/steth.svg`;
  }
  if (symbol === "cbETH") {
    logoUrl = `./assets/icons/cbeth.svg`;
  }
  if (symbol === "ENS") {
    logoUrl = `./assets/icons/ens.svg`;
  }
  if (symbol === "LDO") {
    logoUrl = `./assets/icons/ldo.svg`;
  }
  if (symbol === "LUSD") {
    logoUrl = `./assets/icons/lusd.svg`;
  }
  if (symbol === "rETH") {
    logoUrl = `./assets/icons/reth.svg`;
  }
  if (symbol === "DPI") {
    logoUrl = `./assets/icons/dpi.svg`;
  }
  if (symbol === "MaticX") {
    logoUrl = `./assets/icons/maticx.svg`;
  }
  if (symbol === "MAI") {
    logoUrl = `./assets/icons/mai.svg`;
  }
  if (symbol === "sUSD") {
    logoUrl = `./assets/icons/susd.svg`;
  }
  if (symbol === "WETH") {
    logoUrl = `./assets/icons/weth.svg`;
  }
  if (symbol === "GHO") {
    logoUrl = `./assets/icons/gho.svg`;
  }
  if (symbol === "FRAX") {
    logoUrl = `./assets/icons/frax.svg`;
  }
  if (symbol === "agEUR") {
    logoUrl = `./assets/icons/ageur.svg`;
  }
  if (symbol === "jEUR") {
    logoUrl = `./assets/icons/jeur.svg`;
  }
  if (symbol === "GHST") {
    logoUrl = `./assets/icons/ghst.svg`;
  }
  if (symbol === "miMATIC") {
    logoUrl = `./assets/icons/mai.svg`;
  }
  if (symbol === "EURS") {
    logoUrl = `./assets/icons/eurs.svg`;
  }
  if (symbol === "OP") {
    logoUrl = `./assets/icons/op.svg`;
  }
  if (symbol === "1INCH") {
    logoUrl = `./assets/icons/1inch.svg`;
  }
  if (symbol === "UNI") {
    logoUrl = `./assets/icons/uni.svg`;
  }
  if (symbol === "CRV") {
    logoUrl = `./assets/icons/crv.svg`;
  }
  if (symbol === "SNX") {
    logoUrl = `./assets/icons/snx.svg`;
  }
  if (symbol === "RPL") {
    logoUrl = `./assets/icons/rpl.svg`;
  }
  if (symbol === "RPL") {
    logoUrl = `./assets/icons/rpl.svg`;
  }
  if (symbol === "sDAI") {
    logoUrl = `./assets/icons/sdai.svg`;
  }
  if (symbol === "AAVE") {
    logoUrl = `./assets/icons/aave.svg`;
  }
  if (symbol === "BTCB") {
    logoUrl = `./assets/icons/btcb.svg`;
  }
  if (symbol === "WBNB") {
    logoUrl = `./assets/icons/wbnb.svg`;
  }
  if (symbol === "Cake") {
    logoUrl = `./assets/icons/cake.svg`;
  }
  if (symbol === "FDUSD") {
    logoUrl = `./assets/icons/fdusd.png`;
  }
  if (symbol === "PYUSD") {
    logoUrl = `./assets/icons/pyusd.png`;
  }
  if (symbol === "USDbC") {
    logoUrl = `./assets/icons/usdbc.svg`;
  }
  if (symbol === "sfrxETH") {
    logoUrl = `./assets/icons/sfrxeth.png`;
  }
  return logoUrl;
};
