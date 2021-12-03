const events = require('events');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const { keys } = require('lodash');

const INPUT = path.resolve(__dirname, 'diag.input');

function nthBit(num, n) {
  // shift left to significant position
  const position = 1 << (n - 1);
  // AND to get bit value at significant position
  const anded = num & position;
  // shift right to get significant bit in least position
  return anded >> (n - 1);
}

function mostAndLeastCommonDigit(numbers, n) {
  // get count of 1s in position n
  const ones = numbers.reduce((count, num) => {
    const bit = nthBit(num, n);
    if (bit === 1) {
      count += 1;
    }
    return count;
  }, 0);

  console.log(`Count of ones in position ${n}: ${ones}`);
  let most = ones >= (numbers.length / 2) ? 1 : 0;
  let least = ones < (numbers.length / 2) ? 1 : 0;

  console.log(`Most: ${most}, Least: ${least}`);
  return [most, least];
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
     * life support rating = oxygen generator rating * CO2 scrubber rating
     *
     * To find oxygen generator rating, determine the most common value (0 or 1)
     * in the current bit position, and keep only numbers with that bit in that
     * position. If 0 and 1 are equally common, keep values with a 1 in the
     * position being considered.

     * To find CO2 scrubber rating, determine the least common value (0 or 1) in
     * the current bit position, and keep only numbers with that bit in that
     * position. If 0 and 1 are equally common, keep values with a 0 in the
     * position being considered.
     */

    // example input: 110001101000

    let binaryLength = 0;
    const diagnostics = []

    // grab all diagnostics before continuing
    lines.on('line', (line) => {
      const parsedDiagnostic = parseInt(line, 2);
      binaryLength = line.length > binaryLength ? line.length : binaryLength;
      diagnostics.push(parsedDiagnostic);
    });


    await events.once(lines, 'close');

    console.log(`All diagnostics: ${JSON.stringify(diagnostics)}`);

    let oxygenCandidates = [...diagnostics];
    let co2Candidates = [...diagnostics];

    // calculate oxygen generator and CO2 scrubber ratings
    // fake range (here we want position to go from higher to lower bit)
    for (const position of keys(Array(binaryLength)).reverse()) {
      // position is 0 based in our range
      const bitPosition = parseInt(position, 10) + 1;
      console.log(`Considering bit position: ${bitPosition}`);

      if (oxygenCandidates.length !== 1) {
        let [most,] = mostAndLeastCommonDigit(oxygenCandidates, bitPosition);
        oxygenCandidates = oxygenCandidates.filter((candidate) => {
          const bit = nthBit(candidate, bitPosition);
          return bit === most;
        });
      }

      // have we figured out the CO2 scrubber rating yet?
      if (co2Candidates.length !== 1) {
        let [, least] = mostAndLeastCommonDigit(co2Candidates, bitPosition);
        co2Candidates = co2Candidates.filter((candidate) => {
          const bit = nthBit(candidate, bitPosition);
          return bit === least;
        });
      }
    };

    const lifeSupportRating = oxygenCandidates[0] * co2Candidates[0];

    console.log(`Oxygen generator rating: ${oxygenCandidates[0]}`);
    console.log(`CO2 scrubber rating: ${co2Candidates[0]}`);
    console.log(`Life support rating: ${lifeSupportRating}`);
  } catch (err) {
    console.error(err);
  }
})();
