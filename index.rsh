'reach 0.1';
//participant interact interface that will be shared between the two players.line3-6
const Player = {
    getHand: Fun([], UInt),
    seeOutcome: Fun([UInt], Null),
  };
export const main = Reach.App(() => {
  const Alice = Participant('Alice', {
    // Specify Alice's interact interface here
    ...Player,
  });
  const Bob   = Participant('Bob', {
   // Specify Bob's interact interface here
   ...Player,
  });
  init();
  // write your program here
  Alice.only( ()=>{})
});
//building a version of Rock, Paper, Scissors! where two players,
// Alice and Bob, can wager on the result of the game