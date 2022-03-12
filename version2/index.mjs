import { loadStdlib,ask } from '@reach-sh/stdlib';
import * as backend from './build/index.main.mjs';
const stdlib = loadStdlib();

const startingBalance = stdlib.parseCurrency(100);
const accAlice = await stdlib.newTestAccount(startingBalance);
const accBob = await stdlib.newTestAccount(startingBalance);

const fmt = (x) => stdlib.formatCurrency(x, 4);
const getBalance = async (who) => fmt(await stdlib.balanceOf(who));
const beforeAlice = await getBalance(accAlice);
const beforeBob = await getBalance(accBob);

const ctcAlice = accAlice.contract(backend);
const ctcBob = accBob.contract(backend, ctcAlice.getInfo());

const HAND = ['Rock', 'Paper', 'Scissors'];
const OUTCOME = ['Bob wins', 'Draw', 'Alice wins'];
const Player = (Who) => ({
    ...stdlib.hasRandom, // <--- new!,implementation of rabdom that the frontend provides to the backend
    getHand:async () => {
      const hand = Math.floor(Math.random() * 3);
      console.log(`${Who} played ${HAND[hand]}`);
      //Lines 24 through 29 moves the forced timeout code that we wrote for Bob's acceptWager function into this method. We also change the threshold so that timeouts only happen 1% of the time. This isn't a very interesting behavior, so we'll make it much less frequent.
      if ( Math.random() <= 0.01 ) {
        for ( let i = 0; i < 10; i++ ) {
          console.log(`  ${Who} takes their sweet time sending it back...`);
          await stdlib.wait(1);
        }
      }
      return hand;
    },
    seeOutcome: (outcome) => {
      console.log(`${Who} saw outcome ${OUTCOME[outcome]}`);
    },
    informTimeout: () => {
      console.log(`${Who} observed a timeout`);
    },
  });
//cause a timeout sometimes when Bob is supposed to accept the wager
  await Promise.all([
    ctcAlice.p.Alice({
      ...Player('Alice'),
      wager: stdlib.parseCurrency(5),
      deadline: 10,//Alice specify a deadline of ten blocks.
    }),
    ctcBob.p.Bob({
      ...Player('Bob'),
      acceptWager: async (amt) => { // <-- async now
        if ( Math.random() <= 0.5 ) {
          for ( let i = 0; i < 10; i++ ) {
            console.log(`  Bob takes his sweet time...`);
            await stdlib.wait(1);
          }
        } else {
          console.log(`Bob accepts the wager of ${fmt(amt)}.`);
        }
      },
    }),
  ]);
  
  const afterAlice = await getBalance(accAlice);
  const afterBob = await getBalance(accBob);
  
  console.log(`Alice went from ${beforeAlice} to ${afterAlice}.`);
  console.log(`Bob went from ${beforeBob} to ${afterBob}.`);