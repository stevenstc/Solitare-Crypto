import React, { Component } from "react";

export default class HomeStaking extends Component {
  constructor(props) {
    super(props);

    this.state = {
      myInventario: [],
      itemsYoutube: [],
    };

    this.balance = this.balance.bind(this);
    this.staking = this.staking.bind(this);
    this.myStake = this.myStake.bind(this);
    this.retiro = this.retiro.bind(this);

  }

  async componentDidMount() {
    setInterval(() => {
      this.balance();
      this.myStake();
    }, 1 * 1000);
  }

  async balance() {
    var val = await this.props.wallet.contractToken.methods
        .balanceOf(this.props.currentAccount)
        .call({ from: this.props.currentAccount });
    document.getElementById("getValue").innerHTML = (val/10**18).toFixed(8);
  }

  async staking() {

    var aprovado = await this.props.wallet.contractToken.methods
      .allowance(this.props.currentAccount, this.props.wallet.contractStaking._address)
      .call({ from: this.props.currentAccount });

    var balance = await this.props.wallet.contractToken.methods
      .balanceOf(this.props.currentAccount)
      .call({ from: this.props.currentAccount });

    var valor = document.getElementById("cantidadCSC").value;

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
        if (aprovado > 0) {
          if (Date.now() >= inicio*1000) {
            await this.props.wallet.contractStaking.methods
            .staking(amount)
            .send({ from: this.props.currentAccount });
          }else{
            alert("It's not time");
          }
        }else{
          await this.props.wallet.contractToken.methods
          .approve(this.props.wallet.contractStaking._address, "115792089237316195423570985008687907853269984665640564039457584007913129639935")
          .send({ from: this.props.currentAccount });

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
        <header className="masthead text-center text-white">
          <div className="masthead-content">
            <div className="container px-5">
              <div className="row justify-content-md-center">
                <div className="col-md-auto text-center">
                  <h2 className=" pb-4">STAKING YOUR CSC</h2>
                  <input type="number" className="form-control" id="cantidadCSC" placeholder="Min. 200 CSC"/><br />
                  <button className="btn btn-warning" onClick={()=> this.staking()}><b>Stake CSC</b></button>

                </div>

              </div>

              <div className="row justify-content-md-center mt-5">
                <div className="col-md-auto text-center position-relative">
                    <img src="assets/img/stake01.png" width="270px" alt=""/>
                </div>

                <div className="col-md-auto text-center position-relative">
                    <img src="assets/img/STAKE.png" width="270px"  alt=""/>
                    <div className="centradoStake">
                      <h3 className=" pb-4">
                        {this.state.staked} CSC {" "} {this.state.claim}
                      </h3>
                    </div>
                </div>

                <div className="col-md-auto text-center position-relative">
                    <img src="assets/img/stake02.png" width="270px"  alt=""/>
                </div>

              </div>
            </div>
          </div>
        </header>

        <div className="container mt-3 mb-3">
          <div className="row text-center">
            <div className="col-md-12">
              <img
                id="metaicon"
                className="meta-gray"
                width="100"
                height="100"
                src="data:image/png;base64,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"
                alt="logo metamask"
              />
            </div>
          </div>
          <div className="row text-center">
            <div className="col-md-12">
              <span id="status"></span>
            </div>
          </div>
          <div style={{ marginTop: "30px" }} className="row text-center">
            <div className="col-md-12">
              <h3>Account Info</h3>
              {this.props.currentAccount}
            </div>
          </div>
          <div className="row text-center">
            <div className="col-md-12">
              <span>
                Current balance: <i id="getValue">loading...</i>{" "}
                <button
                  className="btn btn-primary"
                  onClick={async () => this.balance()}
                >
                  Balance
                </button>
              </span>
            </div>
          </div>
         
        </div>
      </>
    );
  }
}
