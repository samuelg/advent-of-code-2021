import fs from 'fs';
import { URL } from 'url';
import _ from 'lodash';

const MARKED = 'X';

// read all lines from input file
function readInput(test = false) {
  const testInput = new URL('./test.input', import.meta.url).pathname;
  const input = new URL('./squid.input', import.meta.url).pathname;

  return fs.readFileSync(test ? testInput : input, 'utf8');
};

function getNumbers(input) {
  return _.first(input.split('\n\n')).split(',');
}

function getBoards(input) {
  return input
    .split('\n\n')
    .slice(1)
    .map((b) => b.split('\n'))
    .map((b) => b.map((r) => r.split(' ').filter((c) => !_.isEmpty(c))));
}

function markBoards(num, boards, marked) {
  boards.forEach((board, boardIndex) => {
    board.forEach((row, rowIndex) => {
      row.forEach((col, columnIndex) => {
        if (col === num) {
          marked[boardIndex][rowIndex][columnIndex] = MARKED;
        }
      });
    });
  });
}

function determineWinners(boards, marked) {
  const winners = [];
  for (let b = 0; b < marked.length; b++) {
    const board = marked[b];
    for (let r = 0; r < board.length; r++) {
      const row = board[r];
      // check the row for a winner
      if (row.every((c) => c === MARKED)) {
        // return the board index
        winners.push(b);
        break;
      }

      // once per board, check every column for a winner
      if (r === 0) {
        for (let c = 0; c < row.length; c++) {
          const col = board.map((row) => row[c])
          if (col.every((r) => r === MARKED)) {
            // return the board index
            winners.push(b);
            break;
          }
        }

        if (_.last(winners) === b) {
          break;
        }
      }
    }
  }

  return winners;
}

function calculateScore(num, winner, markedWinner) {
  let sum = 0;
  winner.forEach((row, rowIndex) => {
    row.forEach((col, columnIndex) => {
      if (markedWinner[rowIndex][columnIndex] !== MARKED) {
        sum += parseInt(col, 10);
      }
    });
  });
  return parseInt(num, 10) * sum;
}

function part1() {
  console.log('Part 1!');
  // true for test input, false for real input
  const input = readInput(false);
  const numbers = getNumbers(input);
  const boards = getBoards(input);
  // keep track of marked rows/columns
  const marked = _.cloneDeep(boards);

  for (let i = 0; i < numbers.length; i++) {
    const num = numbers[i];
    markBoards(num, boards, marked);
    const winners = determineWinners(boards, marked);
    const winner = _.first(winners);
    if (_.isNumber(winner)) {
      console.log('Winner!');
      console.log(boards[winner]);
      console.log(marked[winner]);
      const score = calculateScore(num, boards[winner], marked[winner]);
      console.log(`Score: ${score}`);
      break;
    }
  }
};

function part2() {
  console.log('Part 2!');
  // true for test input, false for real input
  const input = readInput(false);
  const numbers = getNumbers(input);
  let boards = getBoards(input);
  // keep track of marked rows/columns
  let marked = _.cloneDeep(boards);
  let lastWinner;

  for (let i = 0; i < numbers.length; i++) {
    // no more boards to consider
    if (_.isEmpty(boards)) {
      break;
    }

    const num = numbers[i];
    markBoards(num, boards, marked);
    const currentWinners = determineWinners(boards, marked);
    if (!_.isEmpty(currentWinners)) {
      // keep track of the last winning board in case it's the last
      lastWinner = { winner: boards[_.last(currentWinners)], markedWinner: marked[_.last(currentWinners)], num };
      // remove winner from candidate boards
      boards = boards.filter((board, index) => !currentWinners.includes(index));
      marked = marked.filter((markedBoard, index) => !currentWinners.includes(index));
    }
  }

  const { winner, markedWinner, num } = lastWinner;
  console.log('Winner!');
  console.log(winner);
  console.log(markedWinner);
  console.log(`Winning number: ${num}`);
  const score = calculateScore(num, winner, markedWinner);
  console.log(`Score: ${score}`);
};

(function main() {
  part1();
  part2();
})();
