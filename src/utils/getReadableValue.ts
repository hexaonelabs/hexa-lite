export const getReadableValue = (value: string | number) => {
  const result = Number(value);
  if (result > 1000000000000) {
    return (result / 1000000000000).toFixed(2) + "T";
  }
  if (result > 1000000000) {
    return (result / 1000000000).toFixed(2) + "B";
  }
  if (result > 1000000) {
    return (result / 1000000).toFixed(2) + "M";
  }
  if (result > 1000) {
    return (result / 1000).toFixed(2) + "K";
  }
  if (result <= 0) {
    return "0";
  }
  return result.toFixed(0);
};