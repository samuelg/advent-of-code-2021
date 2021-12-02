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
    let aim = 0;

    lines.on('line', (line) => {
      const [direction, rawUnit] = line.split(' ');
      const unit = parseInt(rawUnit, 10);
      console.log(`Direction: ${direction} Unit: ${unit} Aim: ${aim}`);

      switch (direction) {
        case 'forward':
          horizontal += unit;
          // depth is current aim times the unit for this step
          depth += aim * unit;
          break;
        case 'down':
          aim += unit;
          break;
        default:
          // default to up
          aim -= unit;
      }

      console.log(`Current position - Horizontal: ${horizontal} Depth: ${depth} Aim: ${aim}`);
    });

    await events.once(lines, 'close');

    console.log(`Final horizontal position: ${horizontal}`);
    console.log(`Final depth position: ${depth}`);
    console.log(`Final aiming: ${aim}`);

    const answer = horizontal * depth;
    console.log(`Answer: ${answer}`);
  } catch (err) {
    console.error(err);
  }
})();
