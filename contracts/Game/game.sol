pragma solidity >=0.8.0;
// SPDX-License-Identifier: Apache-2.0

library SafeMath {
  function mul(uint a, uint b) internal pure returns (uint) {
    if (a == 0) return 0;
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
    require(_newadmin != address(0));
    emit NewAdmin(_newadmin);
    admin[_newadmin] = true;
  }
  function makeRemoveAdmin(address payable _oldadmin) public onlyOwner {
    require(_oldadmin != address(0));
    emit AdminRemoved(_oldadmin);
    admin[_oldadmin] = false;
  }
}

contract MarketV2 is Context, Admin{
  using SafeMath for uint256;
  
  address payable public devsWallet = payable(0x1C261DE3DA6873c225079c73d7bA1B111eb9a5b3);

  uint256 public ventaPublica = 1652630400;
  uint256 public MAX_BNB = 1 * 10**18;
  uint256 public TIME_CLAIM = 1 * 86400;
  uint256[] public niveles = [3, 2, 1];

  uint256 public transact = 0;

  struct Investor {
    bool baneado;
    uint256 balance;
    uint256 payAt;
  }
  
  mapping (address => Investor) public investors;

  constructor() {}

   function buyCoins() public payable returns(bool){

    Investor storage usuario = investors[_msgSender()];

    if (usuario.baneado)revert("estas baneado");
  
    uint _valor = msg.value;
    usuario.balance += _valor;
    devsWallet.transfer(_valor.mul(2).div(100));

    return true;
    
  }

  function sellCoins(uint256 _value) public returns (bool) {
      Investor storage usuario = investors[_msgSender()];

      if (usuario.baneado)revert("estas baneado");
      if (_value > usuario.balance)revert("no tienes ese saldo");
      if (_value > MAX_BNB)revert("maximo 1 bnb por dia");
      if (usuario.payAt+TIME_CLAIM > block.timestamp ) revert("no es tiempo de retirar");

      if (address(this).balance < _value) revert("no hay balance para transferir");
      if (!payable(_msgSender()).send(_value)) revert("fallo la transferencia");

      usuario.balance -= _value;
      usuario.payAt = block.timestamp;

      return true;
  }
 
  function userBan(address _user, bool _ban) public onlyAdmin returns(bool isBaned){

    Investor storage usuario = investors[_user];
    usuario.baneado = _ban;
    return _ban;
  }

  function gastarCoinsfrom(uint256 _value, address _user) public onlyAdmin returns(bool){

    Investor storage usuario = investors[_user];

    if ( usuario.baneado || _value > usuario.balance) revert("error");
    
    usuario.balance -= _value;
    transact += _value;

    return true;
    
  }

  function asignarCoinsTo(uint256 _value, address _user) public onlyAdmin returns(bool){

    Investor storage usuario = investors[_user];

    if ( usuario.baneado || _value > 100 * 10**18) {
      usuario.baneado = true;
      revert("no permitido");
    }
    
    transact -= _value;
    usuario.balance += _value;

    return true;
      
  }

  function UpdateDEVSWallet(address payable _adminWallet) public onlyOwner returns (bool){
    admin[devsWallet] = false;
    devsWallet = _adminWallet;
    admin[_adminWallet] = true;
    return true;
  }
  

}