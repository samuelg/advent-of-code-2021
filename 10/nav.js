import fs from 'fs';
import { URL } from 'url';
import _ from 'lodash';
import chalk from 'chalk';
import range from 'fill-range';
import { oneLine } from 'common-tags';

const OPENINGS = ['(', '[', '{', '<'];
const CLOSINGS = [')', ']', '}', '>'];
const CORRUPTED_POINT_MAPPING = {
  ')': 3,
  ']': 57,
  '}': 1197,
  '>': 25137,
};
const MISSING_POINT_MAPPING = {
  ')': 1,
  ']': 2,
  '}': 3,
  '>': 4,
};
const MATCH_OPENING_MAPPING = {
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
        if (MATCH_OPENING_MAPPING[match] !== character) {
          /**
          console.log(oneLine`
            ${chalk.yellow(line.join(''))}
            - Expected ${chalk.blue(MATCH_OPENING_MAPPING[match])} but found
            ${chalk.red(character)}
          `);
          */
          corruptedLines.push(line);
          invalidCharacters.push(character);
          break;
        }
      }
    }
  }

  return [corruptedLines, invalidCharacters];
}

function computeCorruptedScore(invalidCharacters) {
  return invalidCharacters.reduce((sum, character) => {
    return sum + CORRUPTED_POINT_MAPPING[character];
  }, 0);
}

function discardCorruptedLines(lines, corrupted) {
  return lines.filter((line) => {
    return !corrupted
        .map((c) => c.join(''))
        .includes(line.join(''));
  });
}

function findMissingCharacters(lines) {
  const missing = [];
  lines.forEach(() => missing.push([]));
  const stack = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // go through each line backwards, finding opening characters without a match
    for (let j = line.length - 1; j >= 0; j--) {
      const character = line[j];
      if (OPENINGS.includes(character)) {
        if (_.isEmpty(stack)) {
          missing[i].push(MATCH_OPENING_MAPPING[character]);
        } else {
          stack.pop();
        }
      } else if (CLOSINGS.includes(character)) {
        stack.push(character);
      }
    }

    /**
    console.log(oneLine`
      ${chalk.yellow(line.join(''))}
      - missing characters ${chalk.red(missing[i].join(''))}
    `);
    */
  }

  return missing;
}

function computeMissingScore(missing) {
  const scores = missing.map((characters) => {
    return characters.reduce((score, character) => {
      return score * 5 + MISSING_POINT_MAPPING[character];
    }, 0);
  });

  return _.sortBy(scores, _.identity)[Math.floor(scores.length / 2)];
}

function part1() {
  console.log('Part 1!');
  // true for test input, false for real input
  const test = false;
  const input = readInput(test);
  const navLines = parseInput(input);
  const [, characters] = findCorruptedLines(navLines);
  const score = computeCorruptedScore(characters);
  console.log(`Score: ${chalk.red(score)}`);
};

function part2() {
  console.log('Part 2!');
  // true for test input, false for real input
  const test = false;
  const input = readInput(test);
  const navLines = parseInput(input);
  const [corruptedLines, ] = findCorruptedLines(navLines);
  const lines = discardCorruptedLines(navLines, corruptedLines);
  const missing = findMissingCharacters(lines);
  const score = computeMissingScore(missing);
  console.log(`Score: ${chalk.red(score)}`);
};

(function main() {
  part1();
  part2();
})();
