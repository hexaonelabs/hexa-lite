
export const  getAllocationRatioInPercent = (tokenBalance: number, totalBalance: number) => {
  return tokenBalance / totalBalance * 100;
}