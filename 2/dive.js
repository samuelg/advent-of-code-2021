import events from 'events';
import fs from 'fs';
import { URL } from 'url';
import readline from 'readline';

const INPUT = new URL('./dive.input', import.meta.url).pathname;

// read all lines from input file
(async function processLineByLine() {
  try {
    const lines = readline.createInterface({
      input: fs.createReadStream(INPUT),
      crlfDelay: Infinity
    });

    // initial position
    let horizontal = 0;
    let depth = 0;

    lines.on('line', (line) => {
      const [direction, rawUnit] = line.split(' ');
      const unit = parseInt(rawUnit, 10);
      console.log(`Direction: ${direction} Unit: ${unit}`);

      switch (direction) {
        case 'forward':
          horizontal += unit;
          break;
        case 'down':
          depth += unit;
          break;
        default:
          // default to up
          depth -= unit;
      }

      console.log(`Current position - Horizontal: ${horizontal} Depth: ${depth}`);
    });

    await events.once(lines, 'close');

    console.log(`Final horizontal position: ${horizontal}`);
    console.log(`Final depth position: ${depth}`);

    const answer = horizontal * depth;
    console.log(`Answer: ${answer}`);
  } catch (err) {
    console.error(err);
  }
})();
