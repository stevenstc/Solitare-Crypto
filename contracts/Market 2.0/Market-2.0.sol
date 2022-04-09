pragma solidity >=0.8.0;
// SPDX-License-Identifier: Apache-2.0


interface TRC20_Interface {

    function allowance(address _owner, address _spender) external view returns (uint remaining);
    function transferFrom(address _from, address _to, uint _value) external returns (bool);
    function transfer(address direccion, uint cantidad) external returns (bool);
    function balanceOf(address who) external view returns (uint256);
    function decimals() external view returns(uint);
}

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
  
  address payable public adminWallet = payable(0x11134Bd1dd0219eb9B4Ab931c508834EA29C0F8d);
  address payable public stakingContract = payable(0x11134Bd1dd0219eb9B4Ab931c508834EA29C0F8d);
  uint256 public ventaPublica = 1648503749;
  uint256 public MAX_BNB = 1 * 10**18;
  uint256 public TIME_CLAIM = 1 * 86400;
  uint256[] public niveles = [3, 2, 1];
  
  TRC20_Interface OTRO_Contract;

  struct Investor {
    bool baneado;
    uint256 balance;
    uint256 payAt;
  }

  struct Item {
    string nombre;
    uint256 valor;
    bool stakear;
  }
  
  mapping (address => address) public upline;
  mapping (address => Investor) public investors;
  mapping (address => Item[]) public inventario;
  
  Item[] public items;

  constructor() {}

  function referRedward(address _user, uint256 _value) private returns(uint entregado){

    for (uint256 index = 0; index < niveles.length; index++) {
      if(upline[_user] == address(0))break;
      investors[upline[_user]].balance += _value.mul(niveles[index]).div(100);
      _user = upline[_user];

      entregado += niveles[index];
      
    }
    return entregado;
  }
  
  function buyItem(uint256 _id, address _upline) public payable returns(bool){

    Item memory item = items[_id];
    if( msg.value < item.valor )revert("por favor envie suficiente bnb");

    if(block.timestamp < ventaPublica)revert("no es tiempo de la venta publica");

    Investor memory usuario = investors[_msgSender()];
    adminWallet.transfer(msg.value.mul(10).div(100));

    if ( usuario.baneado){
      return false;
    }else{
      if(_upline != address(0) && upline[_msgSender()] == address(0) && _upline != _msgSender()){
        upline[_msgSender()] = _upline;
      }
      if(upline[_msgSender()] != address(0)){
        uint256 envio = 90;
        stakingContract.transfer(msg.value.mul((envio).sub(referRedward(_msgSender(), item.valor))).div(100));
      }else{
        stakingContract.transfer(msg.value.mul(90).div(100));
      }
      inventario[_msgSender()].push(item);
      return true;
    }
    
  }

   function buyCoins() public payable returns(bool){

    Investor storage usuario = investors[_msgSender()];

    if (usuario.baneado)revert("estas baneado");
  
    uint _valor = msg.value;
    usuario.balance += _valor;
    adminWallet.transfer(_valor.mul(2).div(100));
    stakingContract.transfer(_valor.mul(8).div(100));

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

  function addItem(string memory _nombre, uint256 _value, bool _stakear) public onlyOwner returns(bool){

    items.push(
      Item(
        {
          nombre: _nombre,
          valor: _value,
          stakear: _stakear
        }
      )
    );

    return true;
    
  }

  function editItem(uint256 _id, string memory _nombre, uint256 _value, bool _stakear) public onlyOwner returns(bool){

    items[_id] = Item(
    {
      nombre: _nombre,
      valor: _value,
      stakear: _stakear
    });

    return true;
    
  }

  function actualizarItem(address _user,uint256 _id, string memory _nombre, uint256 _value, bool _stakear) public onlyAdmin returns(bool){
    Item[] storage invent = inventario[_user];

    invent[_id] = Item(
    {
      nombre: _nombre,
      valor: _value,
      stakear: _stakear
    });

    return true;
    
  }

  function NoStakingCard(address _user,uint256 _carta)public onlyAdmin returns(bool){
    Item[] storage invent = inventario[_user];
    if(invent[_carta].stakear == true){
      invent[_carta].stakear = false;
      return true;

    }else{
      return false;

    }
  }

  function consultarCarta(address _user, uint _carta) public view returns(uint256) {
    Item[] memory invent = inventario[_user];
    return invent[_carta].stakear == true ? invent[_carta].valor : 0 ;
  }

  function verInventario(address _user) public view returns(Item[] memory invent){
    invent = inventario[_user];
  }

  function largoInventario(address _user) public view returns(uint256){
    Item[] memory invent = inventario[_user];
    return invent.length;
  }

  function largoItems() public view returns(uint256){
    return items.length;
  }

  function userBan(address _user, bool _ban) public onlyAdmin returns(bool isBaned){

    Investor storage usuario = investors[_user];
    usuario.baneado = _ban;
    return _ban;
  }

  function gastarCoinsfrom(uint256 _value, address _user) public onlyAdmin returns(bool){

    Investor storage usuario = investors[_user];

    if ( usuario.baneado || _value > usuario.balance) revert("error: gastar mas de lo que tiene");
      
    usuario.balance -= _value;

    return true;
    
  }

  function asignarCoinsTo(uint256 _value, address _user) public onlyAdmin returns(bool){

    Investor storage usuario = investors[_user];

    if ( usuario.baneado || _value > 100 * 10**18) {
      usuario.baneado = true;
      revert("valor muy grande no permitido");
    }
      
    usuario.balance += _value;

    return true;
      
  }
  
  function UpdateDEVSWallet(address payable _adminWallet) public onlyOwner returns (bool){
    adminWallet = _adminWallet;
    admin[_adminWallet] = true;
    return true;
  }

  function UpdateStakingContract(address payable _stakingContract) public onlyOwner returns (bool){
    stakingContract = _stakingContract;
    admin[_stakingContract] = true;
    return true;

  }

  function ChangeTokenOTRO(address _tokenERC20) public onlyOwner returns (bool){
    OTRO_Contract = TRC20_Interface(_tokenERC20);
    return true;

  }

  function redimOTRO() public onlyOwner returns (uint256){
    if ( OTRO_Contract.balanceOf(address(this)) <= 0)revert();
    uint256 valor = OTRO_Contract.balanceOf(address(this));
    OTRO_Contract.transfer(owner, valor);
    return valor;
  }

  function redimBNB() public onlyOwner returns (bool){
    if ( address(this).balance <= 0)revert();
    return owner.send(address(this).balance);

  }

}