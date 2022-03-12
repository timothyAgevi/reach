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
    const Alice = Participant('Alice', {
      ...Player,
      wager: UInt,
    });
    const Bob   = Participant('Bob', {
      ...Player,
      acceptWager: Fun([UInt], Null),
    });
    init() 
  //enable Alice publish her hand but also keep it secret using makeCommitment
  Alice.only(() => {
    const wager = declassify(interact.wager);
    const _handAlice = interact.getHand();//Alice compute her hand, but not declassify it
    const [_commitAlice, _saltAlice] = makeCommitment(interact, _handAlice);//compute comitment,interact since it has salt value generated bu random func inside hasrandom
    const commitAlice = declassify(_commitAlice);//declassify commitment
  });
  Alice.publish(wager, commitAlice)//publish
    .pay(wager);// wager fund in publication
   commit();//siko sure

  unknowable(Bob,Alice(_handAlice,_saltAlice));//states the knowledge assertion
  Bob.only(() => {
    interact.acceptWager(wager);
    const handBob = declassify(interact.getHand());
  });
  Bob.publish(handBob)
    .pay(wager);
  commit();//transaction commit, without computing the payout, because we can't yet, because Alice's hand is not yet public.
  //Alice who can reveal her secrets
  Alice.only(() => {// declassify secret 
    const saltAlice = declassify(_saltAlice);
    const handAlice = declassify(_handAlice);
  });
  Alice.publish(saltAlice, handAlice);// publish secret
  checkCommitment(commitAlice, saltAlice, handAlice);//checks that the published values match the original values.
  //Always case for honest but dishonest participants may violate this

const outcome = winner(handAlice,handBob);
const                 [forAlice, forBob] =
  outcome == A_WINS ? [       2,      0] :
  outcome == B_WINS ? [       0,      2] :
  /* tie           */ [       1,      1];
transfer(forAlice * wager).to(Alice);
transfer(forBob   * wager).to(Bob);
commit();

each([Alice, Bob], () => {
  interact.seeOutcome(outcome);
});
});