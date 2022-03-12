import { loadStdlib, ask } from '@reach-sh/stdlib';
import * as backend from './build/index.main.mjs';
const stdlib = loadStdlib();

const isAlice = await ask.ask(
  `Are you Alice?`,
  ask.yesno
);
const who = isAlice ? 'Alice' : 'Bob';

console.log(`Starting Rock, Paper, Scissors! as ${who}`);

let acc = null;
//choice of creating a test account if they can or inputting a secret to load an existing account.
const createAcc = await ask.ask(
  `Would you like to create an account? (only possible on devnet)`,
  ask.yesno
);
if (createAcc) {//creates the test account as before
  acc = await stdlib.newTestAccount(stdlib.parseCurrency(1000));
} else {
  const secret = await ask.ask(
    `What is your account secret?`,
    (x => x)
  );//loads the existing account
  acc = await stdlib.newAccountFromSecret(secret);
}

let ctc = null;
if (isAlice) {
  ctc = acc.contract(backend);
  ctc.getInfo().then((info) => {//deploy it and print out public information (ctc.getInfo) line30- 32
    console.log(`The contract is deployed as = ${JSON.stringify(info)}`); });
} else {//Lines 34 through 39 request, parse, and process this information
  const info = await ask.ask(
    `Please paste the contract information:`,
    JSON.parse
  );
  ctc = acc.contract(backend, info);
}
const fmt = (x) => stdlib.formatCurrency(x, 4);
const getBalance = async () => fmt(await stdlib.balanceOf(acc));

const before = await getBalance();
console.log(`Your balance is ${before}`);

const interact = { ...stdlib.hasRandom };

interact.informTimeout = () => {
  console.log(`There was a timeout.`);
  process.exit(1);
};
//define a timeout handler
if (isAlice) {
  const amt = await ask.ask(
    `How much do you want to wager?`,
    stdlib.parseCurrency
  );
  interact.wager = amt;
  interact.deadline = { ETH: 100, ALGO: 100, CFX: 1000 }[stdlib.connector];
} else {
  interact.acceptWager = async (amt) => {
    const accepted = await ask.ask(
      `Do you accept the wager of ${fmt(amt)}?`,
      ask.yesno
    );
    if (!accepted) {
      process.exit(0);
    }
  };
}
// request the wager amount or define the acceptWager method, depending on if we are Alice or not.
const HAND = ['Rock', 'Paper', 'Scissors'];
const HANDS = {
  'Rock': 0, 'R': 0, 'r': 0,
  'Paper': 1, 'P': 1, 'p': 1,
  'Scissors': 2, 'S': 2, 's': 2,
};

interact.getHand = async () => {
  const hand = await ask.ask(`What hand will you play?`, (x) => {
    const hand = HANDS[x];
    if ( hand === undefined ) {
      throw Error(`Not a valid hand ${hand}`);
    }
    return hand;
  });
  console.log(`You played ${HAND[hand]}`);
  return hand;
};
//define the shared getHand method
const OUTCOME = ['Bob wins', 'Draw', 'Alice wins'];
interact.seeOutcome = async (outcome) => {
  console.log(`The outcome is: ${OUTCOME[outcome]}`);
};
//seeOutcome method
const part = isAlice ? ctc.p.Alice : ctc.p.Bob;
await part(interact);

const after = await getBalance();
console.log(`Your balance is now ${after}`);

ask.done();