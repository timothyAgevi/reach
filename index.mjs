import { loadStdlib}from '@reach-sh/stdlib'; //imports reach std library loader
import * as backend from './build/index.main.mjs';//import backend that ./reach comile will produce
const stdlib = loadStdlib();//loads the standard library dynamically based on the REACH_CONNECTOR_MODE environment variable

const startingBalance = stdlib.parseCurrency(100);//defines a quantity of network tokens as the starting balance for each test account.
const accAlice = await stdlib.newTestAccount(startingBalance);//
const accBob = await stdlib.newTestAccount(startingBalance);
const fmt = (x) => stdlib.formatCurrency(x, 4);//function for displaying currency amounts with up to 4 decimal places
//create test accounts with initial endowments for Alice and Bob.
const ctcAlice = accAlice.contract(backend);//Alice deploy the application.
const ctcBob = accBob.contract(backend, ctcAlice.getInfo());// Bob attach to it

const HAND = ['Rock', 'Paper', 'Scissors'];//holds aray of hands
const OUTCOME = ['Bob wins', 'Draw', 'Alice wins'];// holds array of outcomes
const Player = (Who) => ({// constructor for player implementation
  getHand: () => {
    const hand = Math.floor(Math.random() * 3);
    console.log(`${Who} played ${HAND[hand]}`);
    return hand;
  },
  seeOutcome: (outcome) => {
    console.log(`${Who} saw outcome ${OUTCOME[outcome]}`);
  },
});
await Promise.all([
  ctcAlice.p.Alice({
    // implement Alice's interact object here
    ...Player('Alice')
  }),
  ctcBob.p.Bob({
    // implement Bob's interact object here
    ...Player('Bob')
  }),
]);