import fs from 'fs';
import { URL } from 'url';
import _ from 'lodash';
import chalk from 'chalk';
import range from 'fill-range';

// segments that are `on` for a given number
const ZERO = 6;
const ZERO_CODE = 'abcefg';
const ONE = 2;
const ONE_CODE = 'cf';
const TWO = 5;
const TWO_CODE = 'acdeg';
const THREE = 5;
const THREE_CODE = 'acdfg';
const FOUR = 4;
const FOUR_CODE = 'bcdf';
const FIVE = 5;
const FIVE_CODE = 'abdfg';
const SIX = 6;
const SIX_CODE = 'abdefg'
const SEVEN = 3;
const SEVEN_CODE = 'acf';
const EIGHT = 7;
const EIGHT_CODE = 'abcdefg';
const NINE = 6;
const NINE_CODE = 'abcdfg';
const UNIQ_DIGITS = [ONE, FOUR, SEVEN, EIGHT];
const DIGIT_MAPPING = {
  [ZERO_CODE]: 0,
  [ONE_CODE]: 1,
  [TWO_CODE]: 2,
  [THREE_CODE]: 3,
  [FOUR_CODE]: 4,
  [FIVE_CODE]: 5,
  [SIX_CODE]: 6,
  [SEVEN_CODE]: 7,
  [EIGHT_CODE]: 8,
  [NINE_CODE]: 9,
};

/**
 *   0:      1:      2:      3:      4:
 *  aaaa    ....    aaaa    aaaa    ....
 * b    c  .    c  .    c  .    c  b    c
 * b    c  .    c  .    c  .    c  b    c
 *  ....    ....    dddd    dddd    dddd
 * e    f  .    f  e    .  .    f  .    f
 * e    f  .    f  e    .  .    f  .    f
 *  gggg    ....    gggg    gggg    ....
 *
 *   5:      6:      7:      8:      9:
 *  aaaa    aaaa    aaaa    aaaa    aaaa
 * b    .  b    .  .    c  b    c  b    c
 * b    .  b    .  .    c  b    c  b    c
 *  dddd    dddd    ....    dddd    dddd
 * .    f  e    f  .    f  e    f  .    f
 * .    f  e    f  .    f  e    f  .    f
 *  gggg    gggg    ....    gggg    gggg
 */

function readInput(test = false) {
  const testInput = new URL('./test.input', import.meta.url).pathname;
  const input = new URL('./caves.input', import.meta.url).pathname;

  return fs.readFileSync(test ? testInput : input, 'utf8');
};

function parseInput(input) {
  const lines = input.split('\n').map((line) => line.split(' | '));
  const signals = lines
      .map((line) => _.first(line))
      .filter((signals) => !_.isEmpty(signals))
      .map((signals) => signals.split(' '));
  const outputs = lines
      .map((line) => _.last(line))
      .filter((outputs) => !_.isEmpty(outputs))
      .map((outputs) => outputs.split(' '));
  return [signals, outputs];
}

function computeUniqueDigits(sequences) {
  return sequences.reduce((uniq, sequence) => {
    const count = sequence
      .filter((digit) => UNIQ_DIGITS.includes(digit.length)).length;
    return uniq + count;
  }, 0);
}

/**
 * Heuristic:
 *
 * find 1 (2 segments)
 * then find 7 (3 segments)
 *    what's not in 1 is segment A
 * find 4 (4 segments)
 *    what's not in 1 or 7 is either B or D
 * find 3 (5 segments where both segments from 1 are present)
 *    either B or D from 4 not present is B, the other is D, last segment from 3 is G
 * find 8 (7 segments)
 *    last segment in 8 we haven't seen yet is E
 * find 2 (5 segments where only one of 1's segment is present and B not present),
 *    whichever segment from 1 present is C, the other F
 */
function deduceMappings(signals, outputs) {
  const mappings = {};
  const digits = _.concat(signals, outputs);
  const one = digits.find((n) => n.length === ONE);
  const seven = digits.find((n) => n.length === SEVEN);
  const four = digits.find((n) => n.length === FOUR);
  const three = digits.find((n) => {
    const segmentsFound = _.filter(one, (segment) => n.includes(segment));
    // 3 has 5 segments and both segments from 1 present (C and F from original mapping)
    return n.length === 5 && segmentsFound.length === 2;
  });
  const eight = digits.find((n) => n.length === EIGHT);

  // determine what maps to A
  const a = seven
    .split('')
    .find((segment) => !_.intersection(one.split(''), seven.split('')).includes(segment));
  mappings[a] = 'a';
  // determine candidates for B and D
  const bdCandidates = four
    .split('')
    .filter((segment) => !_.intersection(one.split(''), four.split('')).includes(segment));
  // determine what maps to B
  const b = bdCandidates.find((segment) => !three.split('').includes(segment));
  mappings[b] = 'b';
  // determine what maps to D
  const d = bdCandidates.find((segment) => segment !== b);
  mappings[d] = 'd';
  // determine what maps to G
  const g = three.split('').find((segment) => !_.concat([a, d], one.split('')).includes(segment));
  mappings[g] = 'g';
  // determine what maps to E
  const e = eight.split('').find((segment) => !_.concat([a, b, d, g], one.split('')).includes(segment));
  mappings[e] = 'e';
  const two = digits.find((n) => {
    // 2 has 5 segments, only one segment from 1 present, but no B segment
    const segmentsFound = _.filter(one, (segment) => n.includes(segment));
    return n.length === 5 && segmentsFound.length === 1 && !n.includes(b);
  });
  // determine what maps to C
  const c = one.split('').find((segment) => two.includes(segment));
  mappings[c] = 'c';
  // determine what maps to F
  const f = one.split('').find((segment) => !two.includes(segment));
  mappings[f] = 'f';

  return mappings;
}

function calculateOutputs(signals, outputs) {
  const realOutputs = [];
  const combined = _.zip(signals, outputs);

  combined.forEach(([iterSignals, iterOutputs]) => {
    const mappings = deduceMappings(iterSignals, iterOutputs);

    realOutputs.push(
      iterOutputs.map((output) => {
        return DIGIT_MAPPING[
          output.split('').map((digit) => mappings[digit]).sort().join('')
        ];
      }).join(''),
    );
  });

  return realOutputs;
}

function sumOutputs(outputs) {
  return outputs.reduce((sum, output) => {
    return sum + parseInt(output, 10);
  }, 0);
}

function part1() {
  console.log('Part 1!');
  // true for test input, false for real input
  const test = false;
  const input = readInput(test);
  const [, outputs] = parseInput(input);
  const uniq = computeUniqueDigits(outputs);
  console.log(`Unique digits in outputs: ${chalk.red(uniq)}`);
};

function part2() {
  console.log('Part 2!');
  // true for test input, false for real input
  const test = false;
  const input = readInput(test);
  const [signals, outputs] = parseInput(input);
  const realOutputs = calculateOutputs(signals, outputs);
  const sum = sumOutputs(realOutputs);
  console.log(`Sum of real outputs: ${chalk.red(sum)}`);
};

(function main() {
  part1();
  part2();
})();
