import React, { Component } from "react";
const BigNumber = require('bignumber.js');

export default class HomeStaking extends Component {
  constructor(props) {
    super(props);

    this.state = {
      myInventario: [],
      itemsYoutube: [],
      cardImage: "images/default2.png",
      card: "default",
      retirableBlock: 0,
      retirable: 0,
      bonus: 0
    };

    this.staking = this.staking.bind(this);
    this.myStake = this.myStake.bind(this);
    this.retiro = this.retiro.bind(this);
    this.inventario = this.inventario.bind(this);

  }

  async componentDidMount() {
 
    setInterval(() => {
      this.myStake();
      this.inventario();
    }, 15*1000);
    this.myStake();
    this.inventario();
  }

  async staking( plan ) {

    var carta = this.state.card;

    if(carta !== "default"){
      var inicio = await this.props.wallet.contractStaking.methods
        .inicio()
        .call({ from: this.props.currentAccount });


      if (Date.now() >= inicio*1000) {
        this.props.wallet.contractStaking.methods
        .staking( plan, carta)
        .send({ from: this.props.currentAccount })
        .then(()=>{
          alert("staking started"); 
          this.myStake(); 
          this.inventario();
          this.setState({
            cardImage: "images/default2.png",
            card: "default",
          })
        })
        .catch((error)=>{
          console.log(error);
          alert("staking failed"); 
          this.myStake(); this.inventario();
          this.setState({
            cardImage: "images/default2.png",
            card: "default",
          });
        })

        
      }else{
        alert("It's not time");
      }
    }else{
      alert("please select a card")
    }

  }

  async myStake() {

    var retirable = await this.props.wallet.contractStaking.methods
    .retirable(this.props.currentAccount)
    .call({ from: this.props.currentAccount });

    var verRetirableBlock = await this.props.wallet.contractStaking.methods
    .retirableBlock(this.props.currentAccount, true)
    .call({ from: this.props.currentAccount });
console.log("error")


    var retirableBlock = await this.props.wallet.contractStaking.methods
    .retirableBlock(this.props.currentAccount, false)
    .call({ from: this.props.currentAccount });
    console.log("error")
    var bonus = await this.props.wallet.contractStaking.methods
    .bonus()
    .call({ from: this.props.currentAccount });

    verRetirableBlock = new BigNumber(verRetirableBlock).shiftedBy(-18).decimalPlaces(6).toString().replace(".", ",");
    retirable = new BigNumber(retirable).shiftedBy(-18).decimalPlaces(6).toString().replace(".", ",");
    retirableBlock = new BigNumber(retirableBlock).shiftedBy(-18).decimalPlaces(6).toString().replace(".", ",");

    this.setState({
      retirable: retirable,
      retirableBlock: retirableBlock,
      verRetirableBlock: verRetirableBlock,
      bonus: bonus/10
    }) 
    
  }

  async retiro() {

    var usuario = await this.props.wallet.contractStaking.methods
      .usuarios(this.props.currentAccount)
      .call({ from: this.props.currentAccount });

    await this.props.wallet.contractStaking.methods
      .retiro(usuario)
      .send({ from: this.props.currentAccount })

  }

  async inventario() {

    var result = await this.props.wallet.contractMarket.methods
      .largoInventario(this.props.currentAccount)
      .call({ from: this.props.currentAccount });

      var inventario = []
      var item = [];

    for (let index = 0; index < result; index++) {
      item[index] = await this.props.wallet.contractMarket.methods
        .inventario(this.props.currentAccount, index)
        .call({ from: this.props.currentAccount });

      if(item[index].stakear)
        inventario.push(

          <div className="col-md-4" style={{cursor:"pointer"}} key={`itemsTeam-${index}`}>
            <img className="img-thumbnail" src={"images/" + item[index].nombre + ".gif"} width="100%" alt={"team "+item[index].nombre} onClick={()=>{this.setState({ cardImage: "images/" + item[index].nombre + ".gif", card: index})} } />
          </div>

        )
    }

    if(inventario.length === 0){
      inventario = <h1>No cards to staking, please buy</h1>
    }

    var balance = await this.props.wallet.web3.eth.getBalance(this.props.wallet.contractStaking._address);

    balance = new BigNumber(balance);
    balance = balance.shiftedBy(-18);
    balance = balance.decimalPlaces(2)
    balance = balance.toString();
    balance = balance.replace(".",",")

    this.setState({
      inventario: inventario,
      bnbContract: balance
    })
  }

  render() {
    return (
      <>
      <div className="contenedor">
        <img
          className=" pb-4"
          src="images/banner.png"
          width="100%"
          alt="banner solitaire crypto"
        />
        <div className="item-banner">
          <h1>{this.state.bnbContract} BNB</h1>
          Contract Balance
        </div>
      </div>
        <header className="masthead text-center text-white">
          <div className="masthead-content">
            <div className="container px-5">

          <div className="row">
          
            <div className="col-md-6" >

              <img src="images/mando.png" alt="spnsor" />
              <h3>GAME</h3>
              <p>Solitaire Crypto joins the revolution of one of the fastest growing markets in recent years. Play, Compete, Have Fun and Earn Unlimited Rewards.</p>

            </div>
            <div className="col-md-6" >

              <img src="images/contract.png" alt="spnsor" />
              <h3>SMART CONTRACT</h3>
              <p>Solitaire Crypto Smart Contract gives users the possibility to generate rewards for participation in the BNB currency in a fully Automatic way.</p>

            </div>
          </div>

              <div className="row">
                <div className="col-md-12">
                  <hr></hr>
                  <h1>STAKING YOUR CARD</h1>

                </div>

                <div className="col-md-6">
                  <img
                    className=" pb-4"
                    src={this.state.cardImage}
                    width="250px"
                    alt="card solitaire crypto"
                  />
                  <button type="button" className="btn btn-danger" data-toggle="modal" data-target="#EjemploModal">SELECT</button> {" or "}
                  <a href="/?page=market" className="btn btn-success" >BUY</a>
                  
                </div>

                <div className="col-md-6">
                  <br />

                  <h3>Flexible Balance: {this.state.retirable} BNB</h3>
                  <br />
                  <button type="button" className="btn btn-warning" onClick={async()=>{
                    await this.props.wallet.contractStaking.methods
                    .retiro(false)
                    .send({ from: this.props.currentAccount });}
                  }>Withdraw ~{this.state.retirable} BNB</button>
                  <br />
                  <br />
                  <h3>Loked Balance: {this.state.verRetirableBlock} BNB</h3>
                  <br />
                  <button type="button" className="btn btn-warning" onClick={async()=>{
                    await this.props.wallet.contractStaking.methods
                    .retiro(true)
                    .send({ from: this.props.currentAccount });}
                  }>Withdraw {this.state.retirableBlock} BNB</button>

                  
                </div>

                <div className="col-md-12">
                <hr />
                </div>
                
                <div className="col-md-12">
                  <h2>Flexible + BONUS({this.state.bonus}%)</h2>
                  <p>
                    Condition #1: Time, it will be increased by 0.5% every 24 hours.<br></br>
                    Condition #2: Balance, It will be increased by 1% for every 100BNB that enters the reward pool.
                  </p>
                </div>

                <div className="col-md-12" >
                  <img src="images/plan1.1.png" alt="imagen del plan 1.1"  onClick={()=>{this.staking(0)}} style={{cursor: "pointer"}}/>
                  <img src="images/plan1.2.png" alt="imagen del plan 1.2"  onClick={()=>{this.staking(1)}} style={{cursor: "pointer"}}/>
                  <img src="images/plan1.3.png" alt="imagen del plan 1.3"  onClick={()=>{this.staking(2)}} style={{cursor: "pointer"}}/>
                </div>
                
              </div>


              <div className="row">
                <div className="col-md-12">
                  <hr></hr>
                  <h2>Locked + BONUS({this.state.bonus}%)</h2>
                  <p>
                    Condition #1: Time, it will be increased by 0.5% every 24 hours.<br></br>
                    Condition #2: Balance, It will be increased by 1% for every 100BNB that enters the reward pool.
                  </p>
                </div>

                <div className="col-md-12" >
                  <img src="images/plan2.1.png" alt="imagen del plan 2.1" onClick={()=>{this.staking(3)}} style={{cursor: "pointer"}}/>
        
                  <img src="images/plan2.2.png" alt="imagen del plan 2.2" onClick={()=>{this.staking(4)}} style={{cursor: "pointer"}}/>
 
                  <img src="images/plan2.3.png" alt="imagen del plan 2.3" onClick={()=>{this.staking(5)}} style={{cursor: "pointer"}}/>
                </div>
                
              </div>

              <div className="row">
          
                <div className="col-md-12" >
                  <div  className="contenedor">
                    <img src="images/texto.png" className="img-fluid" alt="sponsor" />
                    <div className="item1" ><img src="images/smc.png" className="img-fluid" align="left" alt=""></img>AUDITED SMART CONTRACT: TESTED AND VERIFIED BY HAZECRYPTO: FAIR,STABLE AND RELIABLE PROJECT YOU CAN TRUST TO</div>
                    <div className="item2"><img src="images/dinero.png" className="img-fluid" align="left" alt=""></img>INCOME START FROM 8% PER DAY: FLEXIBLE ARCHITECTURE WILL BE PROFITABLE FOR ANY INVERSOR : JUST CHOOSE YOUR PLAN AND CLAIM THE PROFITS!</div>
                    <div className="item3"><img src="images/ballena.png" className="img-fluid" align="left" alt=""></img>ANTI-WHALE FEATURES : THE BALANCE OF OUR SMART CONTRACT WILL BE MAINTAINED BY A SYSTEM OF A MAXIMUM WITHDRAWAL PER DAY FOR EACH USER</div>
                    <div className="item4"><img src="images/exchange.png" className="img-fluid" align="left" alt=""></img>3-LEVEL REFERRAL PROGRAM : EARN WHEN PEOPLE INVITED BY YOU MAKE DEPOSITS. YOU ALSO BENEFIT FROM THEIR REFERRALS!</div>
                    <div className="item5"><img src="images/support.png" className="img-fluid" align="left" alt=""></img>24/7 SUPPORT HELP : FEEL FREE TO ASK ANY QUESTION IN OUR GROUP ANY TIME, WE WILL BE GLAD TO HELP YOU!</div>
                    <div className="item6"><img src="images/mando-control.png" className="img-fluid" align="left" alt=""></img>SMART CONTRACT GAMER : THIS UNION WILL BRING UNLIMITED REWARDS AND SUSTAINABILITY TO THE SMART CONTRACT</div>


                  </div>
                </div>

                <div className="col-md-12" >

                <hr></hr>
                  <img src="images/sponsor-1.png" alt="sponsor" />
                  <img src="images/sponsor-2.png" alt="sponsor" />
                  <img src="images/sponsor-3.png" alt="sponsor" />
                  <a href="https://hazecrypto.net/audit/solitairecrypto"><img src="images/sponsor-4.png" alt="haze crypto" /></a>
                <hr></hr>
                </div>
              </div>

      
            </div>
          </div>
        </header>



        <div className="modal fade" id="EjemploModal" tabIndex="-1" role="dialog" aria-labelledby="EjemploModalLabel" aria-hidden="true">
            <div className="modal-dialog" role="document">
                <div className="modal-content bg-dark">
                    <div className="modal-header">
                    <h5 className="modal-title text-ligth align-center" id="EjemploModalLabel">Please Select One Card</h5>
                    <button type="button" className="btn btn-danger" data-dismiss="modal">Close</button>
                    </div>
                    <div className="modal-body ">
                      <div className="container">
                        <div className="row">
                          {this.state.inventario}
                        </div>
                      </div>

                    </div>
                    <div className="modal-footer ">
                    <button type="button" className="btn btn-success" data-dismiss="modal">Done</button>
                    </div>
                    
                </div>
            </div>
        </div>
      </>
    );
  }
}
