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
  init();  // write your program here
  Alice.only( ()=>{//code performed by alice only
      //he backend for Alice interacts with its frontend, gets Alice's hand, and publishes it
      const handAlice = declassify(interact.getHand());// binds that value to the result of interacting with Alice 
  })
  Alice.publish(handAlice);//lice join the application by publishing the value to the consensus network, so it can be used to evaluate the outcome of the game
  commit();//commits the state of the consensus network and returns to "local step" where individual participants can act alone.


  Bob.only( ()=>{
    const handBob = declassify(interact.getHand());
});
Bob.publish(handBob);
const outcome =(handAlice + (4 - handBob)) % 3 ;
commit();
});


//building a version of Rock, Paper, Scissors! where two players,
// Alice and Bob, can wager on the result of the game