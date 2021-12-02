const events = require('events');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const INPUT = path.resolve(__dirname, 'dive.input');

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
