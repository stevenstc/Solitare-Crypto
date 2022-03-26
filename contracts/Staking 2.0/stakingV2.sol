pragma solidity >=0.8.0;
// SPDX-License-Identifier: Apache 2.0

library SafeMath {

    function mul(uint a, uint b) internal pure returns (uint) {
        if (a == 0) {
            return 0;
        }

        uint c = a * b;
        require(c / a == b);

        return c;
    }

    function div(uint a, uint b) internal pure returns (uint) {
        require(b > 0);
        uint c = a / b;

        return c;
    }

    function sub(uint a, uint b) internal pure returns (uint) {
        require(b <= a);
        uint c = a - b;

        return c;
    }

    function add(uint a, uint b) internal pure returns (uint) {
        uint c = a + b;
        require(c >= a);

        return c;
    }

}

interface TRC20_Interface {

    function allowance(address _owner, address _spender) external view returns (uint remaining);
    function transferFrom(address _from, address _to, uint _value) external returns (bool);
    function transfer(address direccion, uint cantidad) external returns (bool);
    function balanceOf(address who) external view returns (uint256);
    function decimals() external view returns (uint256);
    function totalSupply() external view returns (uint256);
}

interface Market_Interface {

    function consultarCarta(address _owner, uint _index) external view returns (uint256);
    function NoStakingCard(address _owner, uint _index) external view returns (bool);

}

abstract contract Context {
    function _msgSender() internal view virtual returns (address) {
        return msg.sender;
    }

    function _msgData() internal view virtual returns (bytes calldata) {
        return msg.data;
    }
}

contract Ownable is Context {
  address payable public owner;
  event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
  constructor(){
    owner = payable(_msgSender());
  }
  modifier onlyOwner() {
    if(_msgSender() != owner)revert();
    _;
  }
  function transferOwnership(address payable newOwner) public onlyOwner {
    if(newOwner == address(0))revert();
    emit OwnershipTransferred(owner, newOwner);
    owner = newOwner;
  }

}

contract Admin is Context, Ownable{
  mapping (address => bool) public admin;

  event NewAdmin(address indexed admin);
  event AdminRemoved(address indexed admin);

  constructor(){
    admin[_msgSender()] = true;
  }

  modifier onlyAdmin() {
    if(!admin[_msgSender()])revert();
    _;
  }

  function makeNewAdmin(address payable _newadmin) public onlyOwner {
    if(_newadmin == address(0))revert();
    emit NewAdmin(_newadmin);
    admin[_newadmin] = true;
  }

  function makeRemoveAdmin(address payable _oldadmin) public onlyOwner {
    if(_oldadmin == address(0))revert();
    emit AdminRemoved(_oldadmin);
    admin[_oldadmin] = false;
  }

}

contract StakingV2 is Context, Admin{
  using SafeMath for uint;

  Market_Interface MARKET_CONTRACT = Market_Interface(0x389ccc30de1d311738Dffd3F60D4fD6188970F45);

  TRC20_Interface OTRO_Contract = TRC20_Interface(0x389ccc30de1d311738Dffd3F60D4fD6188970F45);

  struct Dep {
    uint deposito;
    uint inicio;
    uint payAt;
    uint factor;
    bool bloqueado;
    uint carta;
    uint tiempo;

  }

  uint public inicio = 1636578000;

  mapping (address => Dep[]) public usuarios;

  uint[] public planTiempo = [14 * 86400, 21 * 86400, 28 * 86400, 14 * 86400, 21 * 86400, 28 * 86400];
  uint[] public planRetorno = [112, 136, 140, 193, 275, 292];

  constructor() { }

  function ChangeTokenOTRO(address _tokenTRC20) public onlyOwner returns (bool){

    OTRO_Contract = TRC20_Interface(_tokenTRC20);

    return true;

  }
  
  function staking(bool _bloqueado, uint _plan, uint _carta) public returns (bool) {

    if(block.timestamp < inicio )revert("aun no ha iniciado");

    uint256 _value = MARKET_CONTRACT.consultarCarta(_msgSender(), _carta);

    if( _value <= 0)revert("error al usar la carta");

    Dep[] storage usuario = usuarios[_msgSender()];
    
    usuario.push(Dep(_value, block.timestamp, block.timestamp,planRetorno[_plan],_bloqueado, _carta, planTiempo[_plan]));

    if(MARKET_CONTRACT.NoStakingCard(_msgSender(), _carta) == true ){
      return true;
    }else{
      revert("fallo al marcar carta como stakeada");
    } 

  }

  function retirable(address _user) public view returns (uint){
    Dep[] storage usuario = usuarios[_user];

    uint reti;
    uint finish;
    uint since;
    uint till;

    for (uint256 index = 0; index < usuario.length; index++) {
      if(usuario[index].bloqueado == false ){
        finish = usuario[index].inicio + usuario[index].tiempo;
        since = usuario[index].payAt > usuario[index].inicio ? usuario[index].payAt : usuario[index].inicio;
        till = block.timestamp > finish ? finish : block.timestamp;
        reti += usuario[index].deposito * (till - since) / usuario[index].tiempo;
      }
    }

    return reti;

  }

  function retirableBlock(address _user) public view returns (uint){
    Dep[] storage usuario = usuarios[_user];

    uint reti;
    uint finish;
    uint since;
    uint till;

    for (uint256 index = 0; index < usuario.length; index++) {
      if(usuario[index].bloqueado == true ){
        finish = usuario[index].inicio + usuario[index].tiempo;
        since = usuario[index].payAt > usuario[index].inicio ? usuario[index].payAt : usuario[index].inicio;
        till = block.timestamp > finish ? finish : block.timestamp;

        if(block.timestamp > finish){
          reti += usuario[index].deposito * (till - since) / usuario[index].tiempo;
        }
      }
    }

    return reti;

  }
  
  function retiro( bool _bloqueado) public returns (bool){

    uint _value = _bloqueado == true ? retirableBlock(_msgSender()) : retirable(_msgSender());

    if( _value <= 0)revert("no hay nada para retirar");

    if(payable(_msgSender()).send(_value) == true ){
      return true ;
    }else{
      revert("fallo retiro");
    }

  }

  function actualizarFecha(uint _inicio) public onlyOwner returns(bool){
    inicio = _inicio;
    
    return true;
  }

  function redimOTRO() public onlyOwner returns (uint256){

    uint256 valor = OTRO_Contract.balanceOf(address(this));

    OTRO_Contract.transfer(owner, valor);

    return valor;
  }

  function redimBNB() public onlyOwner returns (uint256){

    if ( address(this).balance == 0)revert();

    payable(owner).transfer( address(this).balance );

    return address(this).balance;

  }

  fallback() external payable {}

  receive() external payable {}

}