import {APP_CSRK, APP_TOKNN} from "@env";

const WS = false;  //TESTNET

const TokenTest = "0x038987095f309d3640F51644430dc6C7C4E2E409"; //token de pruebas
const SCtest = "0xD9bb599445B160D9606EfDa11c34E009CCee237a";// contrato test market v2
const SC2test = "0xC4cC639697DBA2802386386279927C5b894Ec7a7";// contrado test fan youtuber pool apuesta
const SC3test = "0xcB61d29BB0266263C60Caf982A10b307Fd39F73f";// contrado test Staking v2

const SC4 = "0xe5578751439d52cf9958c4cf1A91eeb3b11F854C";// direccion del contrato Faucet Testent

const TOKEN = "0xF0fB4a5ACf1B1126A991ee189408b112028D7A63";
const SC = "0xF29bACE830B2a81c33bC360317A0f9abe154c288";// direccion del contrato Market
const SC2 = "0xbA5ff42070bF60fB307e643b3e458F76E84293Db";// direccion del contrato MyFans
const SC3 = "0xbF17C2Dda48158c6dc23DEEcD41690230C7517D8";// direccion del contrato Staking

const SCK = APP_CSRK;
const SCKDTT = APP_TOKNN;

const API = "http://194.163.169.204:3004/";

const WALLETPAY = "0x1C261DE3DA6873c225079c73d7bA1B111eb9a5b3";
const FACTOR_GAS = 2;


export default {WALLETPAY,FACTOR_GAS, WS, SCtest, SC2test, SC3test, TokenTest, SC, SC2, SC3, SC4, TOKEN, SCK, SCKDTT, API};
