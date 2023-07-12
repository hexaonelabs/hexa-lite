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
  return logoUrl;
};
