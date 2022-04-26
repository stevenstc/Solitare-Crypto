import React, { Component } from "react";
import cons from "../../cons"
const BigNumber = require('bignumber.js');
const Cryptr = require('cryptr');

const cryptr = new Cryptr(cons.SCK);

export default class Home extends Component {
  constructor(props) {
    super(props);

    this.state = {
      inventario: [],
      itemsYoutube: [],
      balance: "Loading...",
      balanceGAME: "Loading...",
      email: "Loading...",
      username: "Loading...",
      register: false,
      pais: "country not selected",
      timeWitdrwal: "Loading...",
      botonwit: true,
      imagenLink: "images/game-data.png"
    }

    this.balance = this.balance.bind(this);
    this.balanceInMarket = this.balanceInMarket.bind(this);
    this.balanceInGame = this.balanceInGame.bind(this);
    this.inventario = this.inventario.bind(this);
    this.updateEmail = this.updateEmail.bind(this);
    this.update = this.update.bind(this);

  }

  async componentDidMount() {

    await this.update();
    

    setInterval(async() => {
      this.balanceInGame();
      this.balanceInMarket();
    },7*1000);
    
  }

  async update() {
     this.balanceInGame();
     this.balance();
     this.balanceInMarket();
     this.inventario();
    
  }



  async balance() {
    var balance = await this.props.wallet.web3.eth.getBalance(this.props.currentAccount);

    balance = new BigNumber(balance);
    balance = balance.shiftedBy(-18).decimalPlaces(4).toString().replace(".", ",");

    //console.log(balance)

    this.setState({
      balance: balance
    });
  }

  async updateEmail() {
    var email = "example@gmail.com";
    email = await window.prompt("enter your email", "example@gmail.com");
    

    var investor =
      await this.props.wallet.contractMarket.methods
        .investors(this.props.currentAccount)
        .call({ from: this.props.currentAccount });


    var disponible = await fetch(cons.API+"api/v1/email/disponible/?email="+email);
    disponible = Boolean(await disponible.text());

    if( !disponible ){
      alert("email not available");
      return;
    }

    if(window.confirm("is correct?: "+email)){
      const encryptedString = cryptr.encrypt(email);
      if (investor.registered) {
        await this.props.wallet.contractMarket.methods
          .updateRegistro(encryptedString)
          .send({ from: this.props.currentAccount });
      }else{
        await this.props.wallet.contractMarket.methods
          .registro(encryptedString)
          .send({ from: this.props.currentAccount });
      }

      this.setState({
        email: email
      })

      
      var datos = {};
      
        datos.email = email;
        
        disponible = await fetch(cons.API+"api/v1/email/disponible/?email="+datos.email);
        disponible = Boolean(await disponible.text());
        if( !disponible ){
          alert("email not available please select a different one");
          return;
        }else{
        
        datos.token =  cons.SCKDTT;
        
        var resultado = await fetch(cons.API+"api/v1/user/update/info/"+this.props.currentAccount,
        {
          method: 'POST', // *GET, POST, PUT, DELETE, etc.
          headers: {
            'Content-Type': 'application/json'
            // 'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: JSON.stringify(datos) // body data type must match "Content-Type" header
        })
        
        if(await resultado.text() === "true"){
          alert("Updated game data")
        }else{
          alert("failed to write game data")
        }
      }

      this.update()

      alert("email Updated");

    }
    this.update();
    
  }

  async balanceInMarket() {
    var investor =
      await this.props.wallet.contractMarket.methods
        .investors(this.props.currentAccount)
        .call({ from: this.props.currentAccount });

        console.log(investor)


    var balance = new BigNumber(investor.balance);

    balance = balance.shiftedBy(-18).decimalPlaces(4).toString().replace(".", ",");

    //console.log(balance)

    this.setState({
      balanceMarket: balance,
    });
  }

  async balanceInGame(){

    var balance = 0;
    var username = "Please register";
    var emailGame = "email game not set";
    var timeWitdrwal = "Loading...";
    var imagenLink = "images/game-data.png";

    var register = await fetch(cons.API+"api/v1/user/exist/"+this.props.currentAccount);
    register = Boolean(await register.text());

    if(register){

      username = await fetch(cons.API+"api/v1/user/username/"+this.props.currentAccount);
      username = await username.text();

      imagenLink = await fetch(cons.API+"api/v1/imagen/user/?username="+username);
      imagenLink = await imagenLink.text();

      document.getElementById("username").innerHTML = username;

      balance = await fetch(cons.API+"api/v1/coins/"+this.props.currentAccount)
      balance = await balance.text();

      emailGame = await fetch(cons.API+"api/v1/user/email/"+this.props.currentAccount+"?tokenemail=nuevo123");
      emailGame = await emailGame.text();

      timeWitdrwal = await fetch(cons.API+"api/v1/time/coinsalmarket/"+this.props.currentAccount);
      timeWitdrwal = await timeWitdrwal.text();

    }

    if(username === ""){
      username = "Please register"
      register = false;
    }

    if(emailGame === "false" || emailGame === ""){
      emailGame = "email game not set";
    }


    this.setState({
      balanceGAME: balance,
      username: username,
      register: register,
      emailGame: emailGame,
      timeWitdrwal: new Date(parseInt(timeWitdrwal)).toString(),
      imagenLink: imagenLink
    });
  }

  async buyCoins(amount){

    var balance = await this.props.wallet.web3.eth.getBalance(this.props.currentAccount);

    balance = new BigNumber(balance);
    balance = balance.shiftedBy(-18);
    balance = balance.decimalPlaces(8).toNumber();

    amount = new BigNumber(amount);
    var compra = amount.shiftedBy(18).decimalPlaces(8);
  
    amount = amount.decimalPlaces(8).toNumber();

    if (balance>=amount && amount > 0 && balance > 0 ) {

      var result = await this.props.wallet.contractMarket.methods
      .buyCoins()
      .send({value: compra, from: this.props.currentAccount });

      if(result){
        alert("coins buyed");
      }
      
    }else{
      alert("insuficient founds")
    }

    this.update();

    
  }

 

  async inventario() {

    var result = await this.props.wallet.contractMarket.methods
      .largoInventario(this.props.currentAccount)
      .call({ from: this.props.currentAccount });

      var inventario = []

    for (let index = result-1; index >= 0; index--) {
      var item = await this.props.wallet.contractMarket.methods
        .inventario(this.props.currentAccount, index)
        .call({ from: this.props.currentAccount });

        inventario.push(

          <div className="col-lg-2 col-md-3 p-1" key={`itemsTeam-${index}`}>
            <img className="pb-4" src={"images/" + item.nombre + ".gif"} width="250px" alt={"team "+item.nombre} />
          </div>

        )
    }

    this.setState({
      inventario: inventario
    })
  }

  render() {

    var syncEmail = (<>
              <button
                className="btn btn-info"
                onClick={async() => {

                  var datos = {};
                  
                  if( this.state.email === "" || this.state.email === "Please update your email"|| this.state.email === "Loading..." || this.state.email === "loading...") {
                    alert("please try again")
                    return;
                  }else{
                    datos.email = this.state.email;
                  }


                  if(true){
                    
                    datos.token =  cons.SCKDTT;
                    
                    var resultado = await fetch(cons.API+"api/v1/user/update/info/"+this.props.currentAccount,
                    {
                      method: 'POST', // *GET, POST, PUT, DELETE, etc.
                      headers: {
                        'Content-Type': 'application/json'
                        // 'Content-Type': 'application/x-www-form-urlencoded',
                      },
                      body: JSON.stringify(datos) // body data type must match "Content-Type" header
                    })
                    
                    if(await resultado.text() === "true"){
                      alert("Email Updated")
                    }else{
                      alert("failed")
                    }
                  }
                  this.setState({
                    emailGame: this.state.email
                  })

                  this.update();
                }}
              >
                <i className="fas fa-sync"></i> sync email to game
              </button>
              <br></br>
    </>)

    if(this.state.emailGame !== "email game not set"){
      syncEmail = (<></>);
    }

    var botonReg = (<>
    {syncEmail}
       <form>
        <input id="pass" onMouseLeave={()=>{document.getElementById("pass").type="password"}} onMouseOver={()=>{document.getElementById("pass").type="text"}} type={"password"} autoComplete="new-password" placeholder="***********"></input>  
      </form>{" "} <br />
              <button
                className="btn btn-info"
                
                onClick={async() => {

                  var datos = {};
                  var tx = {};
                  tx.status = false;
                  datos.password = document.getElementById("pass").value;

                    if(datos.password.length < 8){
                      alert("Please enter a password with a minimum length of 8 characters.");
                      document.getElementById("pass").value = "";
                      return;
                    }else{

                      tx = await this.props.wallet.web3.eth.sendTransaction({
                        from: this.props.currentAccount,
                        to: cons.WALLETPAY,
                        value: 20000+"0000000000"
                      })


                    }

                  console.log(tx.status)

                  if(tx.status){
                    
                    datos.token =  cons.SCKDTT;
                    
                    var resultado = await fetch(cons.API+"api/v1/user/update/info/"+this.props.currentAccount,
                    {
                      method: 'POST', // *GET, POST, PUT, DELETE, etc.
                      headers: {
                        'Content-Type': 'application/json'
                        // 'Content-Type': 'application/x-www-form-urlencoded',
                      },
                      body: JSON.stringify(datos) // body data type must match "Content-Type" header
                    })
                    
                    if(await resultado.text() === "true"){
                      alert("Password Updated")
                    }else{
                      alert("failed")
                    }
                  }

                  this.update()
                }}
              >
                Change Password
              </button>
    </>);

    if(!this.state.register){

    botonReg = (<>

    <button
        className="btn btn-info"
        onClick={async() => {

          var datos = {};
          var tx = {};
          tx.status = false;

          
          datos.username = await prompt("please set a username for the game:")
          var disponible = await fetch(cons.API+"api/v1/username/disponible/?username="+datos.username);
          disponible = Boolean(await disponible.text());
          if( !disponible ){
            alert("username not available");
            return;
          }
          
          datos.password = await prompt("Please enter a password with a minimum length of 8 characters:");
          
            if(datos.password.length < 8){
              alert("Please enter a password with a minimum length of 8 characters.")
              return;
            }


            if( this.state.email === "" || this.state.email === "Please update your email" || this.state.email === "Loading..." || this.state.email === "loading...") {
              datos.email = await prompt("Please enter your email:");
            }else{
              datos.email = this.state.email;
            }
            disponible = await fetch(cons.API+"api/v1/email/disponible/?email="+datos.email);
            disponible = Boolean(await disponible.text());
            if( !disponible ){
              alert("email not available");
              return;
            }

            if(await window.confirm("you want profile image?")){
              datos.imagen = await prompt("Place a profile image link in jpg jpeg or png format, we recommend that it be 500 X 500 pixels","https://cryptosoccermarket.com/assets/img/default-user-csg.png");
            
            }else{
              datos.imagen = "images/game-data.png";
            }


            tx = await this.props.wallet.web3.eth.sendTransaction({
              from: this.props.currentAccount,
              to: cons.WALLETPAY,
              value: 30000+"0000000000"
            }) 
            

          if(tx.status){
            
            datos.token =  cons.SCKDTT;
            
            var resultado = await fetch(cons.API+"api/v1/user/update/info/"+this.props.currentAccount,
            {
              method: 'POST', // *GET, POST, PUT, DELETE, etc.
              headers: {
                'Content-Type': 'application/json'
                // 'Content-Type': 'application/x-www-form-urlencoded',
              },
              body: JSON.stringify(datos) // body data type must match "Content-Type" header
            })
            
            if(await resultado.text() === "true"){
              alert("Updated record")
            }else{
              alert("failed")
            }
          }

          this.update()
        }}
      >
        Register
      </button>

      </>
      
      );

    }


    return (
      <>
      
        <header className="masthead text-center text-white">
          <div className="masthead-content">
            <div className="container px-5">
              
              <div className="row">

              <div className="col-lg-3 col-md-12 p-4 text-center monedas">
                  
                  <h2 className=" pb-4">BASIC</h2>
                  <img
                    className=" pb-4"
                    src="images/basic.png"
                    width="100%"
                    alt=""
                  />
                  <button className="btn btn-success" onClick={() => this.buyCoins(0.025)}>
                    BUY for 0,025 BNB
                  </button>
                </div>

                <div className="col-lg-3 col-md-12 p-4 text-center monedas">
   
                  <h2 className=" pb-4">POPULAR</h2>
                  <img
                    className=" pb-4"
                    src="images/popular.png"
                    width="100%"
                    alt=""
                  />
                  <button className="btn btn-success" onClick={() => this.buyCoins(0.05)}>
                    BUY for 0,05 BNB
                  </button>
                </div>

                <div 
                  className="col-lg-3 col-md-12 p-4 monedas"
               
                >
                  
                  <h2 className=" pb-4">PREMIUM</h2>
                  <img
                    className=" pb-4"
                    src="images/premium.png"
                    width="100%"
                    alt=""
                  />
                  <button className="btn btn-success" onClick={() => this.buyCoins(0.1)}>
                    BUY for 0,1 BNB
                  </button>
                </div>

                <div 
                  className="col-lg-3 col-md-12 p-4 monedas"
                  
                >
                  <h2 className=" pb-4">PROFESSIONAL</h2>
                  <img
                    className=" pb-4"
                    src="images/professional.png"
                    width="100%"
                    alt=""
                  />
                  <button className="btn btn-success" onClick={() => this.buyCoins(1)}>
                    BUY for 1 BNB
                  </button>
                  
                </div>
              </div>
            </div>
          </div>
        </header>

        <hr></hr>

        <div className="container mt-3 mb-3">
          <div className="row text-center">
            <div className="col-lg-6 col-md-6 ">
            <img
                src="images/wallet.png"
                className="meta-gray"
                width="100"
                height="100" 
                alt="markert info"/>
              <h2>Wallet</h2>
              
              <p>{this.props.currentAccount}</p>
              
              <span>
                BNB: {this.state.balance}
              </span>
              <br/>
              <br/>
              <button
                className="btn btn-success"
                onClick={() => this.update()}
              >
               <i className="fas fa-sync"></i> Conect
              </button>
            </div>

            <div className="col-lg-6 col-md-6">

            
            <img
                src={this.state.imagenLink}
                className="meta-gray"
                width="100"
                height="100" 
                alt={"user "+this.state.username}
                style={{cursor:"pointer"}}
                onClick={async() => {

                  var datos = {};
                  var tx = {};
                  tx.status = false;

                  if(await window.confirm("you want update profile image?")){
                    datos.imagen = await prompt("Place a profile image link in jpg jpeg or png format, we recommend that it be 500 X 500 pixels","https://cryptosoccermarket.com/assets/img/default-user-csg.png");
                    tx = await this.props.wallet.web3.eth.sendTransaction({
                      from: this.props.currentAccount,
                      to: cons.WALLETPAY,
                      value: 30000+"0000000000"
                    })
                  }                  

                  if(tx.status){
                    
                    datos.token =  cons.SCKDTT;
                    
                    var resultado = await fetch(cons.API+"api/v1/user/update/info/"+this.props.currentAccount,
                    {
                      method: 'POST', // *GET, POST, PUT, DELETE, etc.
                      headers: {
                        'Content-Type': 'application/json'
                        // 'Content-Type': 'application/x-www-form-urlencoded',
                      },
                      body: JSON.stringify(datos) // body data type must match "Content-Type" header
                    })
                    
                    if(await resultado.text() === "true"){
                      alert("image link Updated")
                    }else{
                      alert("failed")
                    }
                  }

                  this.update()
                }}
            />
            <h2>GAME data</h2>

            <span id="username" onClick={async() => {

              var datos = {};
              var tx = {};
              tx.status = false;

datos.username = await prompt("please set a NEW username for the game:")
  var disponible = await fetch(cons.API+"api/v1/username/disponible/?username="+datos.username);
  disponible = Boolean(await disponible.text());

  if( !disponible ){
    alert("username not available");
    return;
  }else{
    tx = await this.props.wallet.web3.eth.sendTransaction({
      from: this.props.currentAccount,
      to: cons.WALLETPAY,
      value: 80000+"0000000000"
    }) 
  }

if(tx.status){
  
  datos.token =  cons.SCKDTT;
  
  var resultado = await fetch(cons.API+"api/v1/user/update/info/"+this.props.currentAccount,
  {
    method: 'POST', // *GET, POST, PUT, DELETE, etc.
    headers: {
      'Content-Type': 'application/json'
      // 'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: JSON.stringify(datos) // body data type must match "Content-Type" header
  })
  
  if(await resultado.text() === "true"){
    alert("username Updated")
  }else{
    alert("failed")
  }
}
this.setState({
  username: this.state.email
})

this.update();
}} style={{cursor:"pointer"}}> Username: {this.state.username}</span> | {this.state.emailGame}
              <br /><br />

              {botonReg}
              
            </div>

          </div>
          <hr></hr>
          <div className="row text-center">
          

            <div className="col-lg-6 col-md-12  mt-2">
            <a href={"https://bscscan.com/address/"+this.props.wallet.contractStaking._address+"#tokentxns"}><img
                src="images/exchange-bnb.png"
                className="meta-gray"
                width="100"
                alt="markert info"/></a>

            <h3>EXCHANGE</h3>
              <span>
                SBNB: {this.state.balanceMarket}
              </span>
              <br/><br/>
              <input type="number" id="cantidadSbnb2" step="0.01" defaultValue="0.01"></input><br /><br />
              <button
                className="btn btn-primary"
                onClick={async() => 
                { 

                  var user = await this.props.wallet.contractMarket.methods
                    .investors(this.props.currentAccount )
                    .call({ from: this.props.currentAccount });
                  
                  var cantidad = document.getElementById("cantidadSbnb2").value;
                  console.log(cantidad)
                  var monedas = new BigNumber(parseFloat(cantidad)).shiftedBy(18).toString();
                  var tramite = parseFloat((this.state.balanceMarket).replace(",","."));

                  if(user.payAt+ 86400 <= (Date.now()/1000)  && tramite > 0 && tramite-parseFloat(cantidad) >= 0 && parseFloat(cantidad) >= 0.002 && parseFloat(cantidad) <= 1){
                    
                    console.log(monedas)
                    var result = await this.props.wallet.contractMarket.methods
                    .sellCoins(monedas+"")
                    .send({ from: this.props.currentAccount });

                    alert("your hash transaction: "+result.transactionHash);

                  }else{
                    alert("error")
                    if(parseFloat(cantidad) < 0.002){
                      alert("Please set amount greater than 0.002 SBNB")
                    }

                    if(parseFloat(cantidad) > 1){
                      alert("Set an amount less than 1 SBNB")
                    }

                    if(parseFloat(tramite) < parseFloat(cantidad)){
                      alert("Insufficient Funds")
                    }

                    if(user.payAt+ 86400 > (Date.now()/1000)){
                      alert("Please Wait 24 hours")

                    }
               
                  }

                  this.update();

                }}
              >
                {"<- "}
                Sell SBNB
              </button>

              <br/><br/>
              <button
                className="btn btn-primary"
                onClick={async() => {

                  var tx = {};
                  tx.status = false;

                  var cantidad = new BigNumber(document.getElementById("cantidadSbnb2").value);
                  cantidad = cantidad.shiftedBy(18);

                  var gasLimit = await this.props.wallet.contractMarket.methods.gastarCoinsfrom(cantidad.toString(),  this.props.currentAccount).estimateGas({from: cons.WALLETPAY});
                  gasLimit = gasLimit*cons.FACTOR_GAS;


                  var usuario = await this.props.wallet.contractMarket.methods.investors(this.props.currentAccount).call({from: this.props.currentAccount});
                  var balance = new BigNumber(usuario.balance);
         
                  balance = balance.shiftedBy(-18).toNumber();
                  console.log(balance)
                  cantidad = cantidad.shiftedBy(-18).toNumber();
                  console.log(cantidad)

                  if(balance-cantidad >= 0){
                    tx = await this.props.wallet.web3.eth.sendTransaction({
                      from: this.props.currentAccount,
                      to: cons.WALLETPAY,
                      value: gasLimit+"0000000000"
                    })

                    if(tx.status)

                    var resultado = await fetch(cons.API+"api/v1/coinsaljuego/"+this.props.currentAccount,
                    {
                      method: 'POST', // *GET, POST, PUT, DELETE, etc.
                      headers: {
                        'Content-Type': 'application/json'
                        // 'Content-Type': 'application/x-www-form-urlencoded',
                      },
                      body: JSON.stringify({token: cons.SCKDTT, coins: cantidad}) // body data type must match "Content-Type" header
                    })
                    
                    if(await resultado.text() === "true"){
                      alert("Coins send to GAME")
                    }else{
                      alert("send failed")
                    }
                  }else{
                    alert("insuficient founds")
                  }
                  this.update()
                }}
              >
                {" "}
                Send SBNB To Game {" ->"}
              </button>
            </div>

            <div className="col-lg-6 col-md-12  mt-2">
            <img
                src="images/in-game.png"
                className="meta-gray"
                width="100"
                alt="markert info"/>

            <h3>IN GAME</h3>
              <span>
                SBNB: {this.state.balanceGAME}
              </span>
              <br/><br/>
              <input type="number" id="cantidadSbnb3" step="0.01" defaultValue="0.01"></input><br /><br />
              <button
                className="btn btn-primary"
                onClick={async() => {

                  var tx = {};
                  tx.status = false;

                  var cantidad = document.getElementById("cantidadSbnb3").value;
                  cantidad = parseFloat(cantidad);

                  var balGame = parseFloat((this.state.balanceGAME).replace(",","."))
   
                  if(balGame-cantidad >= 0 && cantidad >= 0.002 && cantidad <= 1){

                    cantidad = new BigNumber(cantidad).shiftedBy(18).toString();
                  
                    var gasLimit = await this.props.wallet.contractMarket.methods.asignarCoinsTo(cantidad+"",  this.props.currentAccount).estimateGas({from: cons.WALLETPAY});
                    
                    gasLimit = gasLimit*cons.FACTOR_GAS;
                    if(this.state.botonwit){
                      this.setState({
                        botonwit: false
                      })
                      tx = await this.props.wallet.web3.eth.sendTransaction({
                        from: this.props.currentAccount,
                        to: cons.WALLETPAY,
                        value: gasLimit+"0000000000"
                      })
                      this.setState({
                        botonwit: true
                      })
                    }


                    if(tx.status && this.state.botonwit){

                      this.setState({
                        botonwit: false
                      })

                      cantidad = new BigNumber(cantidad).shiftedBy(-18).toString();

                      var resultado = await fetch(cons.API+"api/v1/coinsalmarket/"+this.props.currentAccount,
                      {
                        method: 'POST', // *GET, POST, PUT, DELETE, etc.
                        headers: {
                          'Content-Type': 'application/json'
                          // 'Content-Type': 'application/x-www-form-urlencoded',
                        },
                        body: JSON.stringify({token: cons.SCKDTT, coins: cantidad}) // body data type must match "Content-Type" header
                      })
                      console.log(resultado)

                      resultado = await resultado.text();

                      console.log(resultado)

                      if(resultado === "true"){
                        alert("Coins send to EXCHANGE")
                        
                        
                      }else{
                        alert("send failed")
                      }

                      this.setState({
                        botonwit: true
                      })
                    }
                    this.update()
                  }else{
                   
                    if (this.state.balanceGAME-cantidad < 0) {
                      alert("Insufficient funds SBNB")
                    }else{
                      if(cantidad < 0.002 ){
                        alert("Please enter a value greater than 0.002 SBNB")
                      }else{
                        alert("Please enter a value less than 1 SBNB")
                      }
                    }
                    
                  }
                }}
              >
                
                {" <-"} Withdraw To Exchange {" "}
              </button>

            </div>

            <div className="col-lg-12 col-md-12 text-center">
              <hr></hr>
            </div>

          </div>
          
          <div style={{ marginTop: "30px" }} className="row text-center">
            <div className="col-md-12">
              <h3>Inventory</h3>{" "}
              
            </div>
          </div>

          <div className="row text-center" id="inventory">
            {this.state.inventario}
          </div>

         

        </div>
      </>
    );
  }
}
