const events = require('events');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const INPUT = path.resolve(__dirname, 'diag.input');

function nthBit(num, n) {
  // shift left to significant position
  const position = 1 << (n - 1);
  // AND to get bit value at significant position
  const anded = num & position;
  // shift right to get significant bit in least position
  return anded >> (n - 1);
}

function setNthBit(num, n) {
  // shift left to significant position
  const position = 1 << (n - 1);
  // OR with num to set nth bit
  return num | position;
}

// read all lines from input file
(async function processLineByLine() {
  try {
    const lines = readline.createInterface({
      input: fs.createReadStream(INPUT),
      crlfDelay: Infinity
    });

    /**
     * power consumption = gamma rate * epsilon rate (decimal not binary)
     * gamma rate = most common bit in the corresponding position
     * epsilon rate = least common bit from each position
     *
     * example input: 110001101000
    */

    // count of diagnostics
    let count = 0;
    // from bit position 1 to N, count of 1s found at that position
    const diagnostics = [];

    lines.on('line', (line) => {
      count += 1;
      const parsedDiagnostic = parseInt(line, 2);

      console.log(`Diagnostic: ${line} Length: ${line.length}`);
      console.log(`Parsed Diagnostic: ${parsedDiagnostic}`);

      // fake range
      for (const position of Array(line.length).keys()) {
        // position starts at 0
        const bit = nthBit(parsedDiagnostic, position + 1);

        // initialize array at position
        if (!diagnostics[position]) {
          diagnostics[position] = 0;
        }

        // keep track of 1s only, we can determine most common bit based on that
        if (bit === 1) {
          diagnostics[position] += 1;
        }
      }

      console.log(`Current diagnostics summary: ${JSON.stringify(diagnostics)}`);
    });

    await events.once(lines, 'close');

    console.log(`Done parsing input, count of diagnostics: ${count}`);

    // determine most common bit in each position to calculate gamma and epsilon rates
    let gamma = 0;
    let epsilon = 0;

    diagnostics.forEach((ones, position) => {
      if (ones > (count / 2)) {
        // most common bit is a 1
        console.log(`Most common bit at position ${position + 1} is a 1`);
        // position starts at 0
        gamma = setNthBit(gamma, position + 1);
      } else {
        // most common bit is a 0
        console.log(`Least common bit at position ${position + 1} is a 1`);
        // position starts at 0
        epsilon = setNthBit(epsilon, position + 1);
      }
    });

    console.log(`Gamma: ${gamma}, Epsilon: ${epsilon}`);
    const power = gamma * epsilon;
    console.log(`Power: ${power}`);
  } catch (err) {
    console.error(err);
  }
})();
