const events = require('events');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const INPUT = path.resolve(__dirname, 'depth.input');

// read all lines from input file
(async function processLineByLine() {
  try {
    const lines = readline.createInterface({
      input: fs.createReadStream(INPUT),
      crlfDelay: Infinity
    });

    let largerMeasurements = 0;
    // no previous depth for first measurement
    let previousDepth = null;

    lines.on('line', (line) => {
      const depth = parseInt(line, 10);
      console.log(`Depth: ${depth}`);

      if (previousDepth && depth > previousDepth) {
        largerMeasurements += 1;
      }
      previousDepth = depth;
    });

    await events.once(lines, 'close');
    console.log(`Large measurements: ${largerMeasurements}`);
  } catch (err) {
    console.error(err);
  }
})();
