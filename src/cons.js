import {APP_CSRK, APP_TOKNN} from "@env";

const WS = true;  //TESTNET

const TokenTest = "0x038987095f309d3640F51644430dc6C7C4E2E409"; //token de pruebas
const SCtest = "0x2ede4D06150A04EaC5B7EE63A291011D3F09C3bd";// contrato test market v2
const SC2test = "0xC4cC639697DBA2802386386279927C5b894Ec7a7";// contrado test fan youtuber pool apuesta
const SC3test = "0xc30Bd794C31a090c0a8a206d15BCDAad45132c41";// contrado test Staking v2

const SC4 = "0xe5578751439d52cf9958c4cf1A91eeb3b11F854C";// direccion del contrato Faucet Testent

const TOKEN = "0xF0fB4a5ACf1B1126A991ee189408b112028D7A63";
const SC = "0x2846df5d668C1B4017562b7d2C1E471373912509";// direccion del contrato Market
const SC2 = "0xbA5ff42070bF60fB307e643b3e458F76E84293Db";// direccion del contrato MyFans
const SC3 = "0x99dB6D082E5abD682dC8F4791F10FB39Bc334a9c";// direccion del contrato Staking

const SCK = APP_CSRK;
const SCKDTT = APP_TOKNN;

const API = "https://solitaire-crypto-game.herokuapp.com/";

const WALLETPAY = "0x1FBC52A636b9831c2125b6e2f25a3E036EF280e8";
const FACTOR_GAS = 2;


export default {WALLETPAY,FACTOR_GAS, WS, SCtest, SC2test, SC3test, TokenTest, SC, SC2, SC3, SC4, TOKEN, SCK, SCKDTT, API};
