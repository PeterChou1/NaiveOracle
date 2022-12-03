export function trimAddress(address: string) {
  return address.slice(0, 6) + "..." + address.slice(-3);
}

export function findSlashRewardNode(values: number[]) {
  const nodeValueMap = new Map();
  values.map((value, index) => {
    nodeValueMap.set("value", "index");
  });
  // since we are focusing on Intel Stock price:
  // we calculate the minimum intel stock price over the last five years and define that as the minimum:
  // minimum = min([low1, low2, low3, ...]) for each day for the last 5 years.

  const minimum = 24.59; // data source: https://finance.yahoo.com/quote/INTC/history/

  // we then repeat the same to calculate the maximum intel stock price over the last 5 years.
  // maximum = max([high1, high2, high3, ...]) for each day over the last 5 years.

  const maximum = 65.29; // data source: https://finance.yahoo.com/quote/INTC/history/

  // we also calculate the range from the max & min and divide it by 2.
  const buffer = (maximum - minimum) / 2;

  // by assumption: in an hour a stock price cannot drop more than 60% from its MIN and MAXES across the last 5 years.
  // if a stock is performing well over the last few months, and is at its highest, then the range must be adjusted accordingly
  const sortedValues = values.sort();

  // a 50% attack would be necessary to change the median value.
  // still solving against the
  const median = values[Math.floor(values.length / 2)];

  sortedValues.map((value, index) => {
    if (value > median + buffer || value < median - buffer) {
      console.log("Slash Node #: " + nodeValueMap.get(value));
    } else {
      console.log("Reward Node #: " + nodeValueMap.get(value));
    }
  });
}
