
export const  getAllocationRatioInPercent = (tokenBalance: number, totalBalance: number) => {
  const percent = tokenBalance / totalBalance * 100;
  // return percent with 2 decimal places as number
  return parseFloat(percent.toFixed(2));
}