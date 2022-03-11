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
      const handAlice = declassify(interact.getHand());// binds that value to the result of interacting with Alice 
  })
  //lice join the application by publishing the value to the consensus network, so it can be used to evaluate the outcome of the game
  Alice.publish(wager,handAlice)
        .pay(wager);//r transfer the amount as part of her publication
  commit();//commits the state of the consensus network and returns to "local step" where individual participants can act alone.


  Bob.only( ()=>{
    interact.acceptWager(wager);
    const handBob = declassify(interact.getHand());
});
Bob.publish(handBob);
const outcome =(handAlice + (4 - handBob)) % 3 ;// computes outcome
/* onsider when handAlice is 0 (i.e., Rock) and handBob is 2 (i.e., Scissors),
 then this equation is ((handAlice + (4 - handBob)) % 3) = ((0 + (4 - 2)) % 3) = ((0 + 2) % 3) = (2 % 3) = 2*/
commit();
each([Alice, Bob], () => { //local step that each of the participants performs
    interact.seeOutcome(outcome);
  });
});


//building a version of Rock, Paper, Scissors! where two players,
// Alice and Bob, can wager on the result of the game