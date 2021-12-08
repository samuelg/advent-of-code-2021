import fs from 'fs';
import { URL } from 'url';
import _ from 'lodash';
import chalk from 'chalk';
import range from 'fill-range';

// read all lines from input file
function readInput(test = false) {
  const testInput = new URL('./test.input', import.meta.url).pathname;
  const input = new URL('./crabs.input', import.meta.url).pathname;

  return fs.readFileSync(test ? testInput : input, 'utf8');
};

function parseInput(input) {
  return input.replace(/\n/g, '').split(',').map((position) => parseInt(position, 10));
}

function findMean(positions) {
  const sorted = _.sortBy(positions, _.identity);
  const mean = Math.floor(sorted.length / 2);
  return sorted[mean];
}

function calculateFuel(positions, offset, step = _.identity) {
  return positions.reduce((sum, position) => {
    return sum + step(Math.abs(offset - position));
  }, 0);
}

function calculateMinFuel(positions) {
  let minFuel = Infinity;
  const sorted = _.sortBy(positions, _.identity);
  range(_.first(sorted), _.last(sorted)).forEach((offset) => {
    // every step, cost goes up by 1 so 2 away is 1 + 2 = 3
    const step = (n) =>  n * (n + 1) / 2;
    const fuel = calculateFuel(positions, offset, step);
    if (fuel < minFuel) {
      minFuel = fuel;
    }
  });
  return minFuel;
}

function part1() {
  console.log('Part 1!');
  // true for test input, false for real input
  const test = false;
  const input = readInput(test);
  const positions = parseInput(input);
  const mean = findMean(positions);
  const fuel = calculateFuel(positions, mean);
  console.log(`Mean: ${chalk.blue(mean)}, Fuel: ${chalk.red(fuel)}`);
};

function part2() {
  console.log('Part 2!');
  // true for test input, false for real input
  const test = false;
  const input = readInput(test);
  const positions = parseInput(input);
  const fuel = calculateMinFuel(positions);
  console.log(`Fuel: ${chalk.red(fuel)}`);
};

(function main() {
  part1();
  part2();
})();
