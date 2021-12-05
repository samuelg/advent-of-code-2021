import events from 'events';
import fs from 'fs';
import { URL } from 'url';
import readline from 'readline';

const INPUT = new URL('./depth.input', import.meta.url).pathname;

// read all lines from input file
(async function processLineByLine() {
  try {
    const lines = readline.createInterface({
      input: fs.createReadStream(INPUT),
      crlfDelay: Infinity
    });

    let largerMeasurements = 0;
    let slidingWindow = [];
    // no previous measurement until the first sliding window
    let previousMeasurement = null;

    lines.on('line', (line) => {
      const depth = parseInt(line, 10);
      slidingWindow.push(depth);
      console.log(`Sliding window: ${JSON.stringify(slidingWindow)}`);

      if (slidingWindow.length !== 3) {
        return;
      }

      const measurement = slidingWindow.reduce((sum, current) => sum + current, 0);
      console.log(`Measurement: ${measurement}, Previous: ${previousMeasurement}`);
      if (previousMeasurement && measurement > previousMeasurement) {
        largerMeasurements += 1;
        console.log('Measurement larger than previous sliding window');
      }
      previousMeasurement = measurement;
      slidingWindow.shift();
    });

    await events.once(lines, 'close');
    console.log(`Large measurements: ${largerMeasurements}`);
  } catch (err) {
    console.error(err);
  }
})();
