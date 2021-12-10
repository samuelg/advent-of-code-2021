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

function findAdjacentPoints(floor, row, col) {
  const left = [row, Math.max(col - 1, 0)];
  const right = [row, Math.min(col + 1, floor[row].length - 1)];
  const up = [Math.max(row - 1, 0), col];
  const down = [Math.min(row + 1, floor.length - 1), col];

  // exclude current point due to corners and sides
  return [left, up, right, down].filter(([x, y]) => x !== row || y !== col);
}

function isLowPoint(floor, row, col) {
  const adjacent = findAdjacentPoints(floor, row, col);
  return adjacent.every(([x, y]) => floor[x][y] > floor[row][col]);
}

function findLowPointValues(floor) {
  const lowPoints = [];

  for (let row = 0; row < floor.length; row++) {
    for (let col = 0; col < floor[row].length; col++) {
      if (isLowPoint(floor, row, col)) {
        // console.log(`Low point value: ${chalk.red(floor[row][col])}`);
        lowPoints.push(floor[row][col]);
      }
    }
  }

  return lowPoints;
}

function findLowPointCoordinates(floor) {
  const lowPointCoordinates = [];

  for (let row = 0; row < floor.length; row++) {
    for (let col = 0; col < floor[row].length; col++) {
      if (isLowPoint(floor, row, col)) {
        // console.log(`Low point coordinate: ${chalk.red([row, col])}`);
        lowPointCoordinates.push([row, col]);
      }
    }
  }

  return lowPointCoordinates;
}

/**
 * Heuristic:
 *
 * find adjacent points for each low
 * for each point we haven't seen yet for the current basin
 * if it's not a 9 add it to the current basin and get its adjacent points
 * repeat until no more adjacent points can be found
 */
function findBasins(floor, lowPointCoordinates) {
  const basins = [];

  lowPointCoordinates.forEach(([row, col]) => {
    let done = false;
    let basin = [[row, col]];
    let adjacent = findAdjacentPoints(floor, row, col);

    while(!done) {
      if (_.isEmpty(adjacent)) {
        done = true;
        break;
      }
      adjacent = adjacent.reduce((points, [x, y]) => {
        const existing = basin.find(([a, b]) => a === x && b === y);
        if (!existing && floor[x][y] !== 9) {
          basin.push([x, y]);
          points = _.concat(points, findAdjacentPoints(floor, x, y));
        }
        return points;
      }, []);
    }
    // console.log(`Basin: ${chalk.red(JSON.stringify(basin))}`);
    basins.push(basin);
  });

  return basins;
}

function calculateRiskLevel(lowPointValues) {
  return lowPointValues.reduce((riskLevel, lowPointValue) => {
    return riskLevel + lowPointValue + 1;
  }, 0);
}

function calculateProductOfLargestBasins(basins) {
  const largest = _.sortBy(basins.map((points) => points.length), _.identity)
    .slice(basins.length - 3);
  return largest.reduce((product, size) => product * size, 1);
}

function part1() {
  console.log('Part 1!');
  // true for test input, false for real input
  const test = false;
  const input = readInput(test);
  const floor = parseInput(input);
  const lowPointValues = findLowPointValues(floor);
  console.log(`Low points: ${chalk.blue(JSON.stringify(lowPointValues))}`);
  const riskLevel = calculateRiskLevel(lowPointValues);
  console.log(`Risk Level: ${chalk.red(riskLevel)}`);
};

function part2() {
  console.log('Part 2!');
  // true for test input, false for real input
  const test = false;
  const input = readInput(test);
  const floor = parseInput(input);
  const lowPointCoordinates = findLowPointCoordinates(floor);
  const basins = findBasins(floor, lowPointCoordinates);
  const product = calculateProductOfLargestBasins(basins);
  console.log(`Product: ${chalk.red(product)}`);
};

(function main() {
  part1();
  part2();
})();
