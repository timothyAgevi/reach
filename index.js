import React from 'react';
import AppViews from './views/AppViews';
import DeployerViews from './views/DeployerViews';
import AttacherViews from './views/AttacherViews';
import {renderDOM, renderView} from './views/render';
import './index.css';
import * as backend from './build/index.main.mjs';//import backend
import {loadStdlib} from '@reach-sh/stdlib';//load stdlib
const reach = loadStdlib(process.env);//load reach ,pas process.env since does have direct acess to environment variables
//setting wallback to myalgo wallet
import { ALGO_MyAlgoConnect as MyAlgoConnect } from '@reach-sh/stdlib';
reach.setWalletFallback(reach.walletFallback({
    providerEnv: 'TestNet', MyAlgoConnect }));


const handToInt = {'ROCK': 0, 'PAPER': 1, 'SCISSORS': 2};
const intToOutcome = ['Bob wins!', 'Draw!', 'Alice wins!'];
const {standardUnit} = reach;
const defaults = {defaultFundAmt: '10', defaultWager: '3', standardUnit};

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {view: 'ConnectAccount', ...defaults};// initialize the component state to display
  }
  async componentDidMount() {// yo line32hook rcomponentDidMount lifecycle 
    const acc = await reach.getDefaultAccount();//accesses the default browser account. For example, when used with Ethereum, it can discover the currently-selected MetaMask account
    const balAtomic = await reach.balanceOf(acc);
    const bal = reach.formatCurrency(balAtomic, 4);
    this.setState({acc, bal});
    if (await reach.canFundFromFaucet()) {//see if we can access the Reach developer testing network faucet
      this.setState({view: 'FundAccount'});//if true,set the component state to display Fund Account dialog.
    } else {
      this.setState({view: 'DeployerOrAttacher'});//if false,set the component state to skip to Choose Role.
    }
  }
  //Fund Account dialog
  async fundAccount(fundAmount) {// lines 32 thru 35, we define what happens when the user clicks the Fund Account button
    await reach.fundFromFaucet(this.state.acc, reach.parseCurrency(fundAmount));
    this.setState({view: 'DeployerOrAttacher'});//set the component state to display Choose Role
  }
  async skipFundAccount() { this.setState({view: 'DeployerOrAttacher'}); }// define what to do when the user clicks the Skip button, which is to set the component state to display Choose Role.
  selectAttacher() { this.setState({view: 'Wrapper', ContentView: Attacher}); }//sub component for Attacher
  selectDeployer() { this.setState({view: 'Wrapper', ContentView: Deployer}); }//sub-cpmponent for deployer
  render() { return renderView(this, AppViews); }// render the appropriate view from rps-9-web/views/AppViews.js.
}
//callbacks for participant intaract interface
class Player extends React.Component {
  random() { return reach.hasRandom.random(); }//random callback
  async getHand() { // Fun([], UInt)
    const hand = await new Promise(resolveHandP => {// set the component state to display Get Hand dialog, and wait for a Promise which can be resolved via user interaction
      this.setState({view: 'GetHand', playable: true, resolveHandP});
    });
    this.setState({view: 'WaitingForResults', hand});// occurs after the Promise is resolved,sets the component state to display Waiting for results display.
    return handToInt[hand];
  }
  seeOutcome(i) { this.setState({view: 'Done', outcome: intToOutcome[i]}); }//display Done display
  informTimeout() { this.setState({view: 'Timeout'}); }//display timeout display
  playHand(hand) { this.state.resolveHandP(hand); }//define what happens when the user clicks Rock, Paper, or Scissors: The Promise from line 45 is resolved
}//Deployer component  
class Deployer extends Player {
  constructor(props) {
    super(props);
    this.state = {view: 'SetWager'};// set the component state to display Set Wager dialog.
  }
  setWager(wager) { this.setState({view: 'Deploy', wager}); }//set component state to display Deploy dialog when user click set Wager button
  async deploy() {// thru line 62 -69://define what to do when the user clicks  Deploy button
    const ctc = this.props.acc.contract(backend);// call acc.deploy, which triggers a deploy of the contract
    this.setState({view: 'Deploying', ctc});//set the component state to display Deploying display.
    this.wager = reach.parseCurrency(this.state.wager); // UInt provide the wager ,set the wager property
    this.deadline = {ETH: 10, ALGO: 100, CFX: 1000}[reach.connector]; // UInt deadline values,set the deadline property based on which connector is being used
    backend.Alice(ctc, this);//start running the Reach program as Alice,
    const ctcInfoStr = JSON.stringify(await ctc.getInfo(), null, 2);//set the component state to display Waiting for Attacher display
    this.setState({view: 'WaitingForAttacher', ctcInfoStr});//displays the deployed contract info as JSON
  }
  render() { return renderView(this, DeployerViews); }//render the appropriate view from DeployerViews
}
class Attacher extends Player {//provide the acceptWager callback,
  constructor(props) {//define some button handlers in order to attach to the deployed contract
    super(props);
    this.state = {view: 'Attach'};// initialize the component state to display Attach dialog
  }//lines 78 thru 82, we define what happens when the user clicks the Attach button
  attach(ctcInfoStr) {
    const ctc = this.props.acc.contract(backend, JSON.parse(ctcInfoStr));// call acc.attach
    this.setState({view: 'Attaching'});//set the component state to display Attaching display.
    backend.Bob(ctc, this);//start running the Reach program as Bob
  }//define the acceptWager callback
  async acceptWager(wagerAtomic) { // Fun([UInt], Null)
    const wager = reach.formatCurrency(wagerAtomic, 4);
      return await new Promise(resolveAcceptedP => {//set the component state to display Accept Terms dialog, 
      this.setState({view: 'AcceptTerms', wager, resolveAcceptedP});//and wait for a Promise which can be resolved via user interaction
    });
  }
  termsAccepted() {
    this.state.resolveAcceptedP();
    this.setState({view: 'WaitingForTurn'});
  }
  render() { return renderView(this, AttacherViews); }//render the appropriate view from AttacherViews
}
//Putting it all together
renderDOM(<App />);