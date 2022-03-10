import { loadStdlib}from '@reach-sh/stdlib'; //imports reach std library loader
import * as backend from './build/index.main.mjs';//import backend that ./reach comile will produce
const stdlib = loadStdlib();//loads the standard library dynamically based on the REACH_CONNECTOR_MODE environment variable

const startingBalance = stdlib.parseCurrency(100);//defines a quantity of network tokens as the starting balance for each test account.
const accAlice = await stdlib.newTestAccount(startingBalance);//
const accBob = await stdlib.newTestAccount(startingBalance);
//create test accounts with initial endowments for Alice and Bob.
const ctcAlice = accAlice.contract(backend);//Alice deploy the application.
const ctcBob = accBob.contract(backend, ctcAlice.getInfo());// Bob attach to it

await Promise.all([
  ctcAlice.p.Alice({
    // implement Alice's interact object here
  }),
  ctcBob.p.Bob({
    // implement Bob's interact object here
  }),
]);