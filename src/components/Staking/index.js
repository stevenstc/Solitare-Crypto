import React, { Component } from "react";

export default class HomeStaking extends Component {
  constructor(props) {
    super(props);

    this.state = {
      myInventario: [],
      itemsYoutube: [],
    };

    this.staking = this.staking.bind(this);
    this.myStake = this.myStake.bind(this);
    this.retiro = this.retiro.bind(this);

  }

  async componentDidMount() {
    setInterval(() => {

      this.myStake();
    }, 1 * 1000);
  }


  async staking(bloqueado, plan) {


    var balance = await this.props.wallet.contractToken.methods
      .balanceOf(this.props.currentAccount)
      .call({ from: this.props.currentAccount });

    var valor = document.getElementById("cantidadSBNB").value;

    var amount = (valor*10**18).toLocaleString();

    function replaceAll( text, busca, reemplaza ){
      while (text.toString().indexOf(busca) !== -1)
          text = text.toString().replace(busca,reemplaza);
      return text;
    }

    amount = await replaceAll(amount, ".", "" );
    amount = await replaceAll(amount, ",", "" );

    console.log(amount);

    var inicio = await this.props.wallet.contractStaking.methods
      .inicio()
      .call({ from: this.props.currentAccount });

    var fin = await this.props.wallet.contractStaking.methods
      .fin()
      .call({ from: this.props.currentAccount });

    if(Date.now() >= fin*1000 ){
      alert("staking ended");
      return;
    }

    if(balance >= parseInt(valor*10**18)){
   
          if (Date.now() >= inicio*1000) {
            await this.props.wallet.contractStaking.methods
            .staking(amount)
            .send({ from: this.props.currentAccount });
          }else{
            alert("It's not time");
          }
        
      
    }else{
      alert("insuficient Founds");
    }

  }

  async myStake() {

    var rate = await this.props.wallet.contractStaking.methods
      .RATE()
      .call({ from: this.props.currentAccount });

    var usuario = await this.props.wallet.contractStaking.methods
      .usuarios(this.props.currentAccount)
      .call({ from: this.props.currentAccount });

      var stake = (usuario*rate/10**36);

      if (stake > 999) {
        stake = stake.toFixed(6);
      }else{
        stake = stake.toFixed(8);
      }

      var fin = await this.props.wallet.contractStaking.methods
      .fin()
      .call({ from: this.props.currentAccount });

      var claim = <></>;

      if(Date.now() >= fin*1000 && parseInt(usuario) !== 0){
        claim = (<><button className="btn btn-warning" onClick={() => this.retiro()}>Claim</button></>);
      }

    this.setState({
      staked: stake,
      claim: claim
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

  render() {
    return (
      <>
      <img
        className=" pb-4"
        src="images/banner.png"
        width="100%"
        alt=""
      />
        <header className="masthead text-center text-white">
          <div className="masthead-content">
            <div className="container px-5">

              <div className="row">
                <div className="col-md-12">
                  <h1>SELECT YOUR CARD FOR STAKING</h1>
                  <img
                    className=" pb-4"
                    src="images/default2.png"
                    width="100%"
                    alt=""
                  />
                  <button type="button" className="btn btn-danger" data-toggle="modal" data-target="#EjemploModal">SELECT</button> {" or "}
                  <a href="/?page=market" className="btn btn-success" data-toggle="modal" data-target="#EjemploModal">BUY</a>
                  
                  <br />
                  <br />
                  <hr />
                </div>
                
                
                
                <div className="col-md-12">
                  <h2>Flexible</h2>
                </div>

                <div className="col-md-4" data-toggle="modal" data-target="#EjemploModal" onClick={()=>{this.staking(false,0)}} style={{cursor: "pointer"}}>
                  <img src="images/plan1.1.png" alt="imagen del plan 1.1"/>
                </div>
                <div className="col-md-4" onClick={()=>{this.staking(false, 1)}} style={{cursor: "pointer"}}>
                  <img src="images/plan1.2.png" alt="imagen del plan 1.2"/>
                </div>
                <div className="col-md-4" onClick={()=>{this.staking(false, 2)}} style={{cursor: "pointer"}}>
                  <img src="images/plan1.3.png" alt="imagen del plan 1.3"/>
                </div>
                
              </div>


              <div className="row">
                <div className="col-md-12">
                  <hr></hr>
                  <h2>Locked</h2>
                </div>

                <div className="col-md-4" onClick={()=>{this.staking(true, 0)}} style={{cursor: "pointer"}}>
                  <img src="images/plan2.1.png" alt="imagen del plan 2.1"/>
                </div>
                <div className="col-md-4" onClick={()=>{this.staking(true, 1)}} style={{cursor: "pointer"}}>
                  <img src="images/plan2.2.png" alt="imagen del plan 2.2"/>
                </div>
                <div className="col-md-4" onClick={()=>{this.staking(true, 2)}} style={{cursor: "pointer"}}>
                  <img src="images/plan2.3.png" alt="imagen del plan 2.3"/>
                </div>
                
              </div>

      
            </div>
          </div>
        </header>



        <div className="modal fade" id="EjemploModal" tabIndex="-1" role="dialog" aria-labelledby="EjemploModalLabel" aria-hidden="true">
    <div className="modal-dialog" role="document">
        <div className="modal-content">
            <div className="modal-header">
            <h5 className="modal-title text-dark" id="EjemploModalLabel">Please Select One Card</h5>
            <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">{"x"}</span>
            </button>
            </div>
            <div className="modal-body">
              <div className="container">
                <div className="row">
                  <div className="col-md-4">carta 1</div>
                  <div className="col-md-4">carta 2</div>
                  <div className="col-md-4">carta 3</div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
            <button type="button" className="btn btn-secondary" data-dismiss="modal">Cerrar</button>
            <button type="button" className="btn btn-primary">Guardar</button>
            </div>
        </div>
    </div>
</div>
      </>
    );
  }
}
