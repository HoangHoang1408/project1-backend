export function decimalSum(numOfDecimalPart: number = 2, ...numbers: number[]) {
  const x = Math.pow(10, numOfDecimalPart);
  return numbers.reduce((acc, cur) => Math.round(acc * x + cur * x) / x, 0);
}
