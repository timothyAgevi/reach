import { loadStdlib}from '@reach-sh/stdlib'; //imports reach std library loader
import * as backend from './build/index.main.mjs';//import backend that ./reach comile will produce
const stdlib = loadStdlib();//loads the standard library dynamically based on the REACH_CONNECTOR_MODE environment variable

const startingBalance = stdlib.parseCurrency(100);//defines a quantity of network tokens as the starting balance for each test account.
const accAlice = await stdlib.newTestAccount(startingBalance);//
const accBob = await stdlib.newTestAccount(startingBalance);
const fmt = (x) => stdlib.formatCurrency(x, 4);//function for displaying currency amounts with up to 4 decimal places
const getBalance = async (who) => fmt(await stdlib.balanceOf(who));// getting the balance of a participant and displaying it with up to 4 decimal places.
//getting balance of participants before game starts
const beforeAlice = await getBalance(accAlice);
const beforeBob = await getBalance(accBob);
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
    ...Player('Alice'),//splices the common Player interface into Alice's interface.
    wager: stdlib.parseCurrency(5),//defines her wager as 5 units of the network token
  }),
  ctcBob.p.Bob({
    // implement Bob's interact object here
    ...Player('Bob'),
    acceptWager: (amt) => {
      console.log(`Bob accepts the wager of ${fmt(amt)}.`);//show wageer and immedetely accept it by returning it
    },
  }),
]);
//get balance afterwards
const afterAlice = await getBalance(accAlice);
const afterBob = await getBalance(accBob);

//print balance afterwards(effect)
console.log(`Alice went from ${beforeAlice } to ${ afterAlice}.`)
console.log(`Bob went from ${beforeBob} to ${afterBob}.`);