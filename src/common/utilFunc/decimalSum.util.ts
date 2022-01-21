export function decimalSum(numOfDecimalPart: number, ...numbers: number[]) {
  const x = Math.pow(10, numOfDecimalPart);
  return numbers.reduce((acc, cur) => (acc * x + cur * x) / x, 0);
}
