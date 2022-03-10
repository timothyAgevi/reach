'reach 0.1';

export const main = Reach.App(() => {
  const Alice = Participant('Alice', {
    // Specify Alice's interact interface here
  });
  const Bob   = Participant('Bob', {
   // Specify Bob's interact interface here
  });
  init();
  // write your program here
});
//building a version of Rock, Paper, Scissors! where two players,
// Alice and Bob, can wager on the result of the game