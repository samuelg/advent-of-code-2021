import fs from 'fs';
import { URL } from 'url';
import _ from 'lodash';
import chalk from 'chalk';
import range from 'fill-range';

/**
 * 987    (0,0)  (0,1)  (0,2)
 * 856    (1,0)  (1,1)  (1,2)
 * 767    (2,0)  (2,1)  (2,2)
 *
 * 5 is a low point
 */

function readInput(test = false) {
  const testInput = new URL('./test.input', import.meta.url).pathname;
  const input = new URL('./smoke.input', import.meta.url).pathname;

  return fs.readFileSync(test ? testInput : input, 'utf8');
};

function parseInput(input) {
  return input
    .split('\n')
    .map((line) => line.split('').map((n) => parseInt(n, 10)))
    .filter((line) => !_.isEmpty(line));
}

function findLowPoints(floor) {
  const lowPoints = [];

  for (let row = 0; row < floor.length; row++) {
    for (let col = 0; col < floor[row].length; col++) {
      const xs = _.uniq([
        Math.abs(row - 1),
        row,
        Math.min(row + 1, floor.length - 1),
      ]);
      const ys = _.uniq([
        Math.abs(col - 1),
        col,
        Math.min(col + 1, floor[row].length - 1),
      ]);
      // assume low point, try to find point that shows otherwise
      let low = true;

      xs.forEach((x) => {
        ys.forEach((y) => {
          const diagonal = x !== row && y !== col;
          // don't compare with diagonals or current point
          if (diagonal || (x === row && y === col)) {
            return;
          }
          low = !low ? low : floor[x][y] > floor[row][col];
        });
      });

      if (low) {
        // console.log(`Low point: ${chalk.red(floor[row][col])}`);
        lowPoints.push(floor[row][col]);
      }
    }
  }

  return lowPoints;
}

function calculateRiskLevel(lowPoints) {
  return lowPoints.reduce((riskLevel, lowPoint) => {
    return riskLevel + lowPoint + 1;
  }, 0);
}

function part1() {
  console.log('Part 1!');
  // true for test input, false for real input
  const test = false;
  const input = readInput(test);
  const floor = parseInput(input);
  const lowPoints = findLowPoints(floor);
  console.log(`Low points: ${chalk.blue(JSON.stringify(lowPoints))}`);
  const riskLevel = calculateRiskLevel(lowPoints);
  console.log(`Risk Level: ${chalk.red(riskLevel)}`);
};

function part2() {
  console.log('Part 2!');
  // true for test input, false for real input
  const test = true;
  const input = readInput(test);
};

(function main() {
  part1();
  part2();
})();
