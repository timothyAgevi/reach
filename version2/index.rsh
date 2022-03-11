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
    ...hasRandom, // <--- new!
    getHand: Fun([], UInt),
    seeOutcome: Fun([UInt], Null),
  };