import React, { Component } from "react";

import Web3 from "web3";

import Inventory from "../Inventory"
import Market from "../Market";
import Fan from "../Fan";
import Staking from "../Staking"
import TronLinkGuide from "../TronLinkGuide";
import cons from "../../cons"

import abiToken from "../../token";
import abiMarket from "../../market";
import abiFan from "../../fan"
import abiStaking from "../../staking"
import abiFaucet from "../../faucet"

var addressToken = cons.TOKEN;
var addressMarket = cons.SC;
var addressFan = cons.SC2;
var addressStaking = cons.SC3;
var addressFaucet = cons.SC4;

var chainId = '0x38';

if(cons.WS){
  addressToken = cons.TokenTest;
  addressMarket = cons.SCtest;
  addressFan = cons.SC2test;
  addressStaking = cons.SC3test;
  addressFaucet = cons.SC4;
  chainId = '0x61';
}


class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      admin: false,
      metamask: false,
      conectado: false,
      currentAccount: null,
      binanceM:{
        web3: null,
        contractToken: null,
        contractMarket: null
      },
      baneado: false
      
    };

    this.conectar = this.conectar.bind(this);
  }

  async componentDidMount() {

    setInterval(async() => {
      this.conectar();

    },3*1000);

  }

  async conectar(){

    if (typeof window.ethereum !== 'undefined') {

      this.setState({
        metamask: true
      })  

      if(!this.state.baneado){ 
          
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: chainId}],
        });
        
        window.ethereum.request({ method: 'eth_requestAccounts' })
        .then(async(accounts) => {

          var ban = false;//await fetch(cons.API+"api/v1/user/ban/"+accounts[0]);
          //ban = await ban.text();

          if(ban === "true"){
            ban = true;
          }else{
            ban = false;
          }

          //console.log(accounts)
          this.setState({
            currentAccount: accounts[0],
            metamask: true,
            conectado: true,
            baneado: ban
          })
        })
        .catch((error) => {
          console.error(error)
          this.setState({
            metamask: true,
            conectado: false,
            baneado: false
          })   
        });
  
        var web3 = new Web3(window.web3.currentProvider); 
        var contractToken = new web3.eth.Contract(
          abiToken,
          addressToken
        );
        var contractMarket = new web3.eth.Contract(
          abiMarket,
          addressMarket
        );
        var contractFan = new web3.eth.Contract(
          abiFan,
          addressFan
        );
        var contractStaking = new web3.eth.Contract(
          abiStaking,
          addressStaking
        );
        var contractFaucet = new web3.eth.Contract(
          abiFaucet,
          addressFaucet
        )
  
        this.setState({
          binanceM:{
            web3: web3,
            contractToken: contractToken,
            contractMarket: contractMarket,
            contractFan: contractFan,
            contractStaking: contractStaking,
            contractFaucet: contractFaucet
          }
        })
  

      }else{

            var ban = false;//await fetch(cons.API+"api/v1/user/ban/"+accounts[0]);
            //ban = await ban.text();

            if(ban === "true"){
              ban = true;
            }else{
              ban = false;
            }

            this.setState({
              baneado: ban
            })
  
      }
        
    } else {    
      this.setState({
        metamask: false,
        conectado: false
      })         
          
    }

    
    }

  render() {

    
      var getString = "";
      var loc = document.location.href;
      //console.log(loc);
      if(loc.indexOf('?')>0){
                
        getString = loc.split('?')[1];
        getString = getString.split('#')[0];
        getString = getString.split('&')[0];
        getString = getString.split('=')[1];
  
      }

        if(!this.state.baneado){

          if (!this.state.metamask) return (<TronLinkGuide />);
    
          if (!this.state.conectado) return (<TronLinkGuide installed />);
    
          switch (getString) {
            case "youtuber":
            case "myfavorite":
            case "fan": 
              return(<Fan wallet={this.state.binanceM} currentAccount={this.state.currentAccount}/>);
            case "staking":
              return(<Staking wallet={this.state.binanceM} currentAccount={this.state.currentAccount}/>);
            case "market":
              return(<Market wallet={this.state.binanceM} currentAccount={this.state.currentAccount}/>);
            case "inventory":
              return(<Inventory wallet={this.state.binanceM} currentAccount={this.state.currentAccount}/>);
            default:
              return(<Staking wallet={this.state.binanceM} currentAccount={this.state.currentAccount}/>);
          } 
        }else{
          return(<div className="container"><h1 className="text-center">Loading...</h1></div>);

        }

  }
}
export default App;

// {tWeb()}
