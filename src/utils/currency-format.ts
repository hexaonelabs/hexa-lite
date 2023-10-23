
export const currencyFormat = (
  num: number,
  ops?: { currency?: string; language?: string }
) =>  {
  const currency = ops?.currency || "USD";
  const language = ops?.language || "en-US";
  return num.toLocaleString(language, {
    style: "currency",
    currency,
  });
}