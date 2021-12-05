import fs from 'fs';
import { URL } from 'url';
import _ from 'lodash';
import chalk from 'chalk';
import range from 'fill-range';

// read all lines from input file
function readInput(test = false) {
  const testInput = new URL('./test.input', import.meta.url).pathname;
  const input = new URL('./vents.input', import.meta.url).pathname;

  return fs.readFileSync(test ? testInput : input, 'utf8');
};

function parseInput(input) {
  return input
    .split('\n')
    .filter((line) => !_.isEmpty(line))
    .map((line) => line.split(' -> ').map(
      (point) => point.split(',').map((value) => parseInt(value, 10))
    ));
}

function findMaxCoordinates(points) {
  const max = [0, 0];
  points.forEach((lineSegment) => {
    lineSegment.forEach(([x, y]) => {
      if (x > max[0]) {
        max[0] = x;
      }
      if (y > max[1]) {
        max[1] = y;
      }
    })
  });
  return max;
}

function countCollisions(points, [x, y], considerDiagonals = false) {
  let count = 0;
  points.forEach(([[x1, y1], [x2, y2]]) => {
    const xMax = Math.max(x1, x2);
    const xMin = Math.min(x1, x2);
    const yMax = Math.max(y1, y2);
    const yMin = Math.min(y1, y2);

    const horizontal = x1 !== x2 && y1 === y2;
    const vertical = y1 !== y2 && x1 === x2;
    const diagonal = !horizontal && !vertical;
    let onSlope = !diagonal;
    const xOnLine = x <= xMax && x >= xMin;
    const yOnLine = y <= yMax && y >= yMin;

    if (diagonal && considerDiagonals) {
      const slope = (y2 - y1) / (x2 - x1);
      onSlope = y - y1 === slope * (x - x1);
    }
    if (xOnLine && yOnLine && onSlope) {
      count += 1;
    }
  });
  return count;
}

// will print X0-XN / Y0 on the first row
function printDiagram(points, diagonal = false) {
  const max = findMaxCoordinates(points);
  let diagram = '';
  range(0, max[1]).forEach((y) => {
    range(0, max[0]).forEach((x) => {
      const count = countCollisions(points, [x, y], diagonal);
      diagram += (count === 0)
        ? chalk.blue('.')
        : chalk.red.bold(count);
    });
    diagram += '\n';
  });
  console.log(diagram);
}

function calculateCollisionsAboveThreshold(points, threshold, diagonal = false) {
  const max = findMaxCoordinates(points);
  let aboveThreshold = 0;
  range(0, max[1]).forEach((y) => {
    range(0, max[0]).forEach((x) => {
      const count = countCollisions(points, [x, y], diagonal);
      if (count >= threshold) {
        aboveThreshold += 1;
      }
    });
  });
  return aboveThreshold;
}

function part1() {
  console.log('Part 1!');
  // true for test input, false for real input
  const test = false;
  const input = readInput(test);
  const points = parseInput(input);
  if (test) {
    printDiagram(points);
  }
  const count = calculateCollisionsAboveThreshold(points, 2);
  console.log(`Collisions above threshold 2: ${count}`);
};

function part2() {
  console.log('Part 2!');
  // true for test input, false for real input
  const test = false;
  const input = readInput(test);
  const points = parseInput(input);
  if (test) {
    printDiagram(points);
  }
  // true to consider diagonal lines
  const count = calculateCollisionsAboveThreshold(points, 2, true);
  console.log(`Collisions above threshold 2 (including diagonals): ${count}`);
};

(function main() {
  part1();
  part2();
})();
