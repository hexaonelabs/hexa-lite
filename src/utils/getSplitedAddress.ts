export const getSplitedAddress = (address: string, max = 6) => {
  if (max >= address.length) return address;
  return address.slice(0, max) + "..." + address.slice(-4);
};