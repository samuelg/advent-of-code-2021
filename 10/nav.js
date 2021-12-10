import fs from 'fs';
import { URL } from 'url';
import _ from 'lodash';
import chalk from 'chalk';
import range from 'fill-range';
import { oneLine } from 'common-tags';

/**
 * ): 3 points.
 * ]: 57 points.
 * }: 1197 points.
 * >: 25137 points.
 */

const OPENINGS = ['(', '[', '{', '<'];
const CLOSINGS = [')', ']', '}', '>'];
const POINT_MAPPING = {
  ')': 3,
  ']': 57,
  '}': 1197,
  '>': 25137,
};
const MATCH_MAPPING = {
  '(': ')',
  '[': ']',
  '{': '}',
  '<': '>',
};

function readInput(test = false) {
  const testInput = new URL('./test.input', import.meta.url).pathname;
  const input = new URL('./nav.input', import.meta.url).pathname;

  return fs.readFileSync(test ? testInput : input, 'utf8');
};

function parseInput(input) {
  return input
    .split('\n')
    .map((line) => line.split(''))
    .filter((line) => !_.isEmpty(line));
}

function findCorruptedLines(lines) {
  const corruptedLines = [];
  const invalidCharacters = [];
  const stack = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    for (let j = 0; j < line.length; j++) {
      const character = line[j];
      if (OPENINGS.includes(character)) {
        stack.push(character);
      } else if (CLOSINGS.includes(character)) {
        const match = stack.pop();
        if (MATCH_MAPPING[match] !== character) {
          console.log(oneLine`
            ${chalk.yellow(line.join(''))}
            - Expected ${chalk.blue(MATCH_MAPPING[match])} but found
            ${chalk.red(character)}
          `);
          corruptedLines.push(line);
          invalidCharacters.push(character);
          break;
        }
      }
    }
  }

  return [corruptedLines, invalidCharacters];
}

function computeScore(invalidCharacters) {
  return invalidCharacters.reduce((sum, character) => {
    return sum + POINT_MAPPING[character];
  }, 0);
}

function part1() {
  console.log('Part 1!');
  // true for test input, false for real input
  const test = false;
  const input = readInput(test);
  const navLines = parseInput(input);
  const [, characters] = findCorruptedLines(navLines);
  const score = computeScore(characters);
  console.log(`Score: ${chalk.red(score)}`);
};

function part2() {
  console.log('Part 2!');
  // true for test input, false for real input
  const test = true;
  const input = readInput(test);
  const navLines = parseInput(input);
};

(function main() {
  part1();
  part2();
})();
