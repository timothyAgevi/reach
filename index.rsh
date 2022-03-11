'reach 0.1';
//enumerations for the hands that may be played, as well as the outcomes of the game
const [ isHand, ROCK, PAPER, SCISSORS ] = makeEnum(3);
const [ isOutcome, B_WINS, DRAW, A_WINS ] = makeEnum(3);
// function that computes the winner of the game
const winner = (handAlice, handBob) =>
  ((handAlice + (4 - handBob)) % 3);
//participant interact interface that will be shared between the two players.line3-6
const Player = {
    getHand: Fun([], UInt),
    seeOutcome: Fun([UInt], Null),
  };
export const main = Reach.App(() => {
  const Alice = Participant('Alice', {
    // Specify Alice's interact interface here
    ...Player,
    wager: UInt,
  });
  const Bob   = Participant('Bob', {
   // Specify Bob's interact interface here
   ...Player,
   acceptWager: Fun([UInt], Null),//accept wager from Alice
  });
  
  init();  // write your program here
  Alice.only( ()=>{//code performed by alice only
      //he backend for Alice interacts with its frontend, gets Alice's hand, and publishes it
      const wager =declassify(interact.wager);
      const handAlice = declassify(interact.getHand());// binds that value to the result of interacting with Alice 
  })
   //lice join the application by publishing the value to the consensus network, so it can be used to evaluate the outcome of the game
   Alice.publish(wager,handAlice)
      .pay(wager);//r transfer the amount as part of her publication
  commit();//commits the state of the consensus network and returns to "local step" where individual participants can act alone.
  unknowable(Bob, Alice(handAlice));

  Bob.only( ()=>{
    interact.acceptWager(wager);
    const handBob = declassify(interact.getHand());
    //if we putconst handBob = (handAlice + 1) % 3; above,bob will win always since he never consults the frontend and so it never prints out the message of what hand Bob played
});
Bob.publish(handBob)
.pay(wager)
const outcome =(handAlice + (4 - handBob)) % 3 ;// computes outcome
/* onsider when handAlice is 0 (i.e., Rock) and handBob is 2 (i.e., Scissors),
 then this equation is ((handAlice + (4 - handBob)) % 3) = ((0 + (4 - 2)) % 3) = ((0 + 2) % 3) = (2 % 3) = 2*/
 const [ forAlice,forBob]=outcome==2?[ 2,0]:outcome == 0?[ 0,2]:[1,1];/*compute the amounts given to each participant depending on the outcome by
  determining how many wager amounts each party gets

- If the outcome is 2, Alice wins, then she gets two portions; 
while if it is 0, Bob wins, then he gets two portions; 
otherwise they each get one portion
  */

//transfer the corresponding amounts from contract to participants,
//not from participats from each other.since all funds reside inside contract(line 48,49)
transfer(forAlice * wager).to(Alice);
  transfer(forBob   * wager).to(Bob);
commit();
each([Alice, Bob], () => { //local step that each of the participants performs
    interact.seeOutcome(outcome);
  });
});



//note: Alice and Bob's balances go back to 100 every time we run since  it  creates fresh a/c
// Alice win slightly less than Bob when she wins? She has to pay to deploy the contract, because she publishes the first message in her frontend



/*important :Reach programs dont manage tokens instead we Pay and transfer primitives are added to publish primitive.Address
pay:send funds to reach program,
transfer:send funds backto participants
*/
//building a version of Rock, Paper, Scissors! where two players,
// Alice and Bob, can wager on the result of the game