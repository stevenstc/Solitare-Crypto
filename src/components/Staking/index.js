import React, { Component } from "react";

export default class HomeStaking extends Component {
  constructor(props) {
    super(props);

    this.state = {
      myInventario: [],
      itemsYoutube: [],
      cardImage: "images/default2.png",
      card: "default"
    };

    this.staking = this.staking.bind(this);
    this.myStake = this.myStake.bind(this);
    this.retiro = this.retiro.bind(this);
    this.inventario = this.inventario.bind(this);

  }

  async componentDidMount() {
    setInterval(() => {

      this.myStake();
    }, 3 * 1000);

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
        .then(()=>{alert("staking started")})
        .catch(()=>{alert("staking failed")})
      }else{
        alert("It's not time");
      }
    }else{
      alert("please select a card")
    }
        
      

  }

  async myStake() {

    this.setState({
      staked: 0,
      claim: 0
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

    for (let index = 0; index < result; index++) {
      var item = await this.props.wallet.contractMarket.methods
        .inventario(this.props.currentAccount, index)
        .call({ from: this.props.currentAccount });

      if(item.stakear)
        inventario.push(

          <div className="col-md-4" style={{cursor:"pointer"}} key={`itemsTeam-${index}`} onClick={()=>{this.setState({ cardImage: "images/" + item.nombre + ".gif", card: index})} } data-dismiss="modal">
            <img className="img-thumbnail" src={"images/" + item.nombre + ".gif"} width="100%" alt={"team "+item.nombre} />
          </div>

        )
    }

    if(inventario.length === 0){
      inventario = <h1>No cards to staking, please buy</h1>
    }

    this.setState({
      inventario: inventario
    })
  }

  render() {
    return (
      <>
      <img
        className=" pb-4"
        src="images/banner.png"
        width="100%"
        alt="banner solitaire crypto"
      />
        <header className="masthead text-center text-white">
          <div className="masthead-content">
            <div className="container px-5">

              <div className="row">
                <div className="col-md-12">
                  <h1>YOUR CARD FOR STAKING</h1>
                  <img
                    className=" pb-4"
                    src={this.state.cardImage}
                    width="250px"
                    alt="card solitaire crypto"
                  />
                  <button type="button" className="btn btn-danger" data-toggle="modal" data-target="#EjemploModal">SELECT</button> {" or "}
                  <a href="/?page=market" className="btn btn-success" data-toggle="modal" data-target="#EjemploModal">BUY</a>
                  
                  
                  <hr />
                </div>
                
                
                
                <div className="col-md-12">
                  <h2>Flexible</h2>
                </div>

                <div className="col-md-4" onClick={()=>{this.staking(0)}} style={{cursor: "pointer"}}>
                  <img src="images/plan1.1.png" alt="imagen del plan 1.1"/>
                </div>
                <div className="col-md-4" onClick={()=>{this.staking( 1)}} style={{cursor: "pointer"}}>
                  <img src="images/plan1.2.png" alt="imagen del plan 1.2"/>
                </div>
                <div className="col-md-4" onClick={()=>{this.staking( 2)}} style={{cursor: "pointer"}}>
                  <img src="images/plan1.3.png" alt="imagen del plan 1.3"/>
                </div>
                
              </div>


              <div className="row">
                <div className="col-md-12">
                  <hr></hr>
                  <h2>Locked</h2>
                </div>

                <div className="col-md-4" onClick={()=>{this.staking(3)}} style={{cursor: "pointer"}}>
                  <img src="images/plan2.1.png" alt="imagen del plan 2.1"/>
                </div>
                <div className="col-md-4" onClick={()=>{this.staking(4)}} style={{cursor: "pointer"}}>
                  <img src="images/plan2.2.png" alt="imagen del plan 2.2"/>
                </div>
                <div className="col-md-4" onClick={()=>{this.staking(5)}} style={{cursor: "pointer"}}>
                  <img src="images/plan2.3.png" alt="imagen del plan 2.3"/>
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
            
        </div>
    </div>
</div>
      </>
    );
  }
}
