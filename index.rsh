'reach 0.1';
// enumerations for the hands that may be played, as well as the outcomes of the game
const [ isHand, ROCK, PAPER, SCISSORS ] = makeEnum(3);
const [ isOutcome, B_WINS, DRAW, A_WINS ] = makeEnum(3);
//function that computes the winner of the game.
const winner = (handAlice, handBob) =>
  ((handAlice + (4 - handBob)) % 3);
//when rock paper scrosor win,loss.draw
assert(winner(ROCK, PAPER) == B_WINS);
assert(winner(PAPER, ROCK) == A_WINS);
assert(winner(ROCK, ROCK) == DRAW);
//no matter what values are provided for handAlice and handBob, winner will always provide a valid outcome:
forall(UInt, handAlice =>
    forall(UInt, handBob =>
      assert(isOutcome(winner(handAlice, handBob)))));
 //whenever the same value is provided for both hands, no matter what it is, winner always returns DRAW
 forall(UInt, (hand) =>
  assert(winner(hand, hand) == DRAW));   
 //frontend for each participant providing acess to random nmbers
 const Player = {
    ...hasRandom, // <--- new!  ,used to generate random number to protect Alice's hand, interface that the backend expects the frontend to provide
    getHand: Fun([], UInt),
    seeOutcome: Fun([UInt], Null),
    informTimeout: Fun([], Null),//inform frontend to be informed thattimeout occured
  };
  // reach app and interfaces
  export const main = Reach.App(() => {
    const Alice = Participant('Alice', {//define Deployer as a React component for Alice, which extends Player
      ...Player,
      wager: UInt,//atomic units of currency
      deadline:UInt,//time delta(blocks/rounds),std deadline throughout tje program
    });//Attacher component
    const Bob   = Participant('Bob', {
      ...Player,
      acceptWager: Fun([UInt], Null),
    });
    init() 

    const informTimeout = () => {//defines function as arrow function
      each([Alice, Bob], () => { //have each participant perform local step
        interact.informTimeout();// has participants call new inforTimeout method
      });
    };
   
    Alice.only(() => {
      const wager = declassify(interact.wager);
      const deadline = declassify(interact.deadline);
    });
    Alice.publish(wager, deadline)
      .pay(wager);
    commit();
  
    Bob.only(() => {//Bob pay the wager
      interact.acceptWager(wager);
    });
    Bob.pay(wager)
      .timeout(relativeTime(deadline), () => closeTo(Alice, informTimeout));
  //does not have this consensus step commit
    var outcome = DRAW;
    invariant( balance() == 2 * wager && isOutcome(outcome) );//tates the invariant that the body of the loop does not change the balance in the contract account and that outcome is a valid outcome
    while ( outcome == DRAW ) {//continues as long as the outcome is a draw
      commit();//commits the last transaction, which at the start of the loop is Bob's acceptance of the wager, and at subsequent runs of the loop is Alice's publication of her hand.
    //enable Alice publish her hand but also keep it secret using makeCommitment
  Alice.only(() => {
    const _handAlice = interact.getHand();//Alice compute her hand, but not declassify it
    const [_commitAlice, _saltAlice] = makeCommitment(interact, _handAlice);//compute comitment,interact since it has salt value generated bu random func inside hasrandom
    const commitAlice = declassify(_commitAlice);//declassify commitment
      });
  Alice.publish(commitAlice)//publish also the deadline
   .timeout(relativeTime(deadline), () => closeTo(Bob, informTimeout));
   commit();//siko sure
//line64 t0 71 wager is already known and paid.
  unknowable(Bob,Alice(_handAlice,_saltAlice));//states the knowledge assertion
  Bob.only(() => {
    const handBob = declassify(interact.getHand());
  });
  Bob.publish(handBob)
     .timeout(relativeTime(deadline), () => closeTo(Alice, informTimeout));//adds a timeout handler to Bob's publication
  commit();//transaction commit, without computing the payout, because we can't yet, because Alice's hand is not yet public.
  //Alice who can reveal her secrets
  Alice.only(() => {// declassify secret 
    const saltAlice = declassify(_saltAlice);
    const handAlice = declassify(_handAlice);
  });
  Alice.publish(saltAlice, handAlice)// publish secret
  .timeout(relativeTime(deadline), () => closeTo(Bob, informTimeout));//timeout handler to Alice's second message
  checkCommitment(commitAlice, saltAlice, handAlice);//checks that the published values match the original values.
  //Always case for honest but dishonest participants may violate this
   outcome = winner(handAlice,handBob);//updates the outcome loop variable with the new value
   continue;//Reach requires that continue be explicitly written in the loop body
}

assert(outcome == A_WINS || outcome == B_WINS);
  transfer(2 * wager).to(outcome == A_WINS ? Alice : Bob);
  commit();

each([Alice, Bob], () => {
  interact.seeOutcome(outcome);
});
});