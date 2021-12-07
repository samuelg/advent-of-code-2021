import fs from 'fs';
import { URL } from 'url';
import _ from 'lodash';
import chalk from 'chalk';
import BigNumber from 'big-number';

// read all lines from input file
function readInput(test = false) {
  const testInput = new URL('./test.input', import.meta.url).pathname;
  const input = new URL('./fish.input', import.meta.url).pathname;

  return fs.readFileSync(test ? testInput : input, 'utf8');
};

function parseInput(input) {
  return input.replace(/\n/g, '').split(',').map((timer) => parseInt(timer, 10));
}

function getSimulation(initialTimers, simulateDays) {
  // NOTE: this was not my first implementation for part1 but E_NOT_ENOUGH_MEMORY for part2
  // keep track of how many fish have 0 days left, 1 day left, et cetera
  const initial = [0, 0, 0, 0, 0, 0, 0, 0, 0].map((timer) => BigNumber(timer));
  initialTimers.forEach((timer) => {
    initial[timer] = BigNumber(1).plus(initial[timer]);
  });

  return {
    fish: initial,
    day: 0,
    done: false,
    step() {
      this.day += 1;
      if (this.day === simulateDays) {
        this.done = true;
      }
      // 0 is a special case
      const cycleEnd = this.fish[0];
      for (let i = 1; i < this.fish.length; i++) {
        this.fish[i - 1] = this.fish[i];
      }
      // restart cycle
      this.fish[6] = this.fish[6].plus(cycleEnd);
      // new fish created
      this.fish[8] = cycleEnd;
    },
    count() {
      return this.fish.reduce(
        (sum, current) => sum.plus(current),
        BigNumber(0),
      ).toString();
    },
    print() {
      // print the first 20 fish only to speed up terminal output
      const school = this.fish.map((count, timer) => {
        if (timer === 0) {
          return chalk.blue.bold(count.toString());
        } else if (timer === 8) {
          return chalk.red.bold(count.toString());
        } else {
          return count;
        }
      }).join(',');
      console.log(`After day ${chalk.yellow.bold(this.day)}, there are ${chalk.red.bold(this.count())} fish: ${school}`);
    },
  };
}

function part1() {
  console.log('Part 1!');
  // true for test input, false for real input
  const test = false;
  const input = readInput(test);
  const initialTimers = parseInput(input);
  const simulation = getSimulation(initialTimers, 80);
  while (!simulation.done) {
    simulation.print();
    simulation.step();
  }
  // print last step
  simulation.print();
};

function part2() {
  console.log('Part 2!');
  // true for test input, false for real input
  const test = false;
  const input = readInput(test);
  let initialTimers = parseInput(input);
  const simulation = getSimulation(initialTimers, 256);
  while (!simulation.done) {
    simulation.print();
    simulation.step();
  }
  // print last step
  simulation.print();
};

(function main() {
  part1();
  part2();
})();
