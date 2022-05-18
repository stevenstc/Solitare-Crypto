import React, { Component } from "react";
const BigNumber = require('bignumber.js');


export default class Market extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      inventario: [],
      itemsYoutube: [(
        <div className="col-lg-12 p-3 mb-5 text-center monedas position-relative" key={`items-0`}>
          <h2 className=" pb-2">Loading... please wait</h2>
        </div>
      )],
      balance: "Loading...",
      referLink: "Loading...",
      repVideo: "video/card-1.mp4",
    }

    this.balance = this.balance.bind(this);
    this.inventario = this.inventario.bind(this);
    this.items = this.items.bind(this);
    this.buyItem = this.buyItem.bind(this);
    this.update = this.update.bind(this);

  }

  async componentDidMount() {

    await this.update();

    setInterval(() => {
      this.update();
    }, 3 * 1000);

  }

  async update() {

    await this.balance();
    await this.inventario();
    await this.items();

  }

  async balance() {
    var investor = await this.props.wallet.contractMarket.methods
    .investors(this.props.currentAccount)
    .call({ from: this.props.currentAccount });

    var balance = new BigNumber(investor.balance);
    balance = balance.shiftedBy(-18).decimalPlaces(6).toString();

    this.setState({
      balance: balance,
      referLink: window.location.origin+"/?page=market&wallet="+this.props.currentAccount
    });
  }


  async buyItem(id){

    var wallet = "0x0000000000000000000000000000000000000000";

    var getString = "";
    var loc = document.location.href;

    if(loc.indexOf('?')>0){
                
      getString = loc.split('?')[1];
      getString = getString.split('#')[0];
      getString = getString.split('&');
      if(getString.length > 1){
        getString = getString[1].split('=')[1];
        wallet = getString;
      }
      
    }

    console.log(wallet)

    var item =  await this.props.wallet.contractMarket.methods
    .items(id)
    .call({ from: this.props.currentAccount });
  
    var result = await this.props.wallet.contractMarket.methods
      .buyItem(id, wallet)
      .send({value: item.valor, from: this.props.currentAccount });

      console.log(result)
    if(result.status){
      var video=document.getElementById('video'); 
      video.play(); 
    }else{
      alert("fail");
    }
    


    this.update();

  }

  async items() {
    if(!this.state.loading){
      this.setState({
        loading: true
      });

      var itemsYoutube = [];
      var listItems = [];

      var result = await this.props.wallet.contractMarket.methods.largoItems().call({ from: this.props.currentAccount });
        //console.log(result)

      for (let index = 0; index < result; index++) {

        var item = await this.props.wallet.contractMarket.methods.items(index).call({ from: this.props.currentAccount });
        
        listItems[index]= item;
        //console.log(item)
        itemsYoutube[index] = (
            <div className="col-lg-3 col-md-6 p-3 mb-5 text-center monedas position-relative" key={`items-${index}`}>
              <h2 className=" pb-2"> <span role="img" aria-labelledby="rombo">♦️</span> {item.nombre}</h2>
              <button type="button" className="btn btn-success" data-toggle="modal" data-target="#modalVideo" onClick={async() => {
                await this.setState({
                  repVideo: "video/card-"+(index+1)+".mp4"
                })
                this.buyItem(index);
                }}>
                {item.valor/10**18} BNB
              </button>
              <img
                className=" pb-2"
                src={"images/default.png"}
                width="100%"
                alt=""
              />


             
            </div>
        );

      }

      this.setState({
        itemsYoutube: itemsYoutube,
        loading: false
      });
    }
    
  }


  async inventario() {

    var result = await this.props.wallet.contractMarket.methods
      .largoInventario(this.props.currentAccount)
      .call({ from: this.props.currentAccount });

      var inventario = []

    for (let index = 0; index < result; index++) {
      var item = await this.props.wallet.contractMarket.methods
        .inventario(this.props.currentAccount, index)
        .call({ from: this.props.currentAccount });

        //console.log(item)

        inventario[index] = (

          <div className="col-md-3 p-1" key={`itemsTeam-${index}`}>
            <img className="pb-4" src={"assets/img/" + item.nombre + ".png"} width="100%" alt={"team-"+item.nombre} />
          </div>

        )
    }

    this.setState({
      inventario: inventario
    })
  }

  copyToClipBoard() {

    var content = document.getElementById('textArea');
    
    content.select();
    document.execCommand('copy');

    alert("Copied!");
}

  render() {
    return (
      <><header className="masthead text-center text-white">
      <div className="masthead-content">
        <div className="contenedor">
          <img src="images/ref.png" alt=""></img>
          <div className="item-market2">Generate rewards in bnb without initial investment, inviting your friends</div>
          <div className="container px-5 item-market">
            <div className="row">
              <div className="col-lg-12 col-md-12 p-4 text-center" >
                <h3>Refer link: </h3>
                <div className="input-group mb-3">
                  <input type="text" className="form-control" id="textArea" onClick={()=>{this.copyToClipBoard()}} value={this.state.referLink} readOnly />
                  <div className="input-group-append">
                    <button className="btn btn-outline-danger" type="button" onClick={()=>{this.copyToClipBoard()}}>Copy</button>
                  </div>
                </div>
                <h3 className=" pb-4">Referral earnings: {this.state.balance} BNB <button className="btn btn-warning" onClick={()=>{
                  if(new BigNumber(this.state.balance).toNumber(10) > 0){
                   this.props.wallet.contractMarket.methods
                    .sellCoins(new BigNumber(this.state.balance).shiftedBy(18))
                    .send({ from: this.props.currentAccount });
                  }else{
                    alert("error amount");
                  }
                  }}>withdraw</button></h3>
              </div>

            </div>
          </div>
        </div>
        <div className="container px-5">
          <div className="row">
            <div className="col-lg-12 col-md-12 p-4 text-center">
              <h2 className=" pb-4">Cards</h2>
            </div>

            {this.state.itemsYoutube}

          </div>
        </div>
      </div>
    </header>

    <div className="modal fade bd-example-modal-lg" id="modalVideo" tabIndex="-1" role="dialog" aria-labelledby="modalVideo" aria-hidden="true">
            <div className="modal-dialog modal-lg" role="document">
                <div className="modal-content bg-dark">
                    <div className="modal-header">
                    <h5 className="modal-title text-ligth align-center" id="EjemploModalLabel">Your card </h5>
                    <button type="button" className="btn btn-danger" data-dismiss="modal">Close</button>
                    </div>
                    <div className="modal-body ">
                    <video id="video" src={this.state.repVideo} width="100%" >  error #354
                    </video> 
                    </div>
                    
                </div>
            </div>
        </div>

        

      </>
    );
  }
}
