pragma solidity >=0.8.0;
// SPDX-License-Identifier: Apache-2.0


interface TRC20_Interface {

    function allowance(address _owner, address _spender) external view returns (uint remaining);

    function transferFrom(address _from, address _to, uint _value) external returns (bool);

    function transfer(address direccion, uint cantidad) external returns (bool);

    function balanceOf(address who) external view returns (uint256);

    function decimals() external view returns(uint);
}

interface ITRC721 {
    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
    event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId);
    event ApprovalForAll(address indexed owner, address indexed operator, bool approved);

    function balanceOf(address owner) external view returns (uint256 balance);
    function ownerOf(uint256 tokenId) external view returns (address owner);
    function safeTransferFrom(address from, address to, uint256 tokenId) external;
    function transferFrom(address from, address to, uint256 tokenId) external;
    function approve(address to, uint256 tokenId) external;
    function getApproved(uint256 tokenId) external view returns (address operator);

    function setApprovalForAll(address operator, bool _approved) external;
    function isApprovedForAll(address owner, address operator) external view returns (bool);

    function safeTransferFrom(address from, address to, uint256 tokenId, bytes memory data) external;
}

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
  
  address public token = 0xF0fB4a5ACf1B1126A991ee189408b112028D7A63;
  address public adminWallet = 0x004769eF6aec57EfBF56c24d0A04Fe619fBB6143;

  uint256 public ventaPublica = 1635349239;

  uint256 public MIN_CSC = 500 * 10**18;
  uint256 public MAX_CSC = 10000 * 10**18;

  uint256 public TIME_CLAIM = 7 * 86400;
  
  TRC20_Interface OTRO_Contract = TRC20_Interface(token);

  struct Tipos {
    string tipo;
    bool ilimitados;
    uint256 cantidad;

  }

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
  
  mapping (address => Investor) public investors;
  mapping (address => Item[]) public inventario;
  mapping (uint256 => address) public nfts;
  mapping (uint256 => address) public idNfts;
  
  Item[] public items;
  Tipos[] public opciones;

  uint256 ingresos;
  uint256 retiros;

  constructor() {}
  
  function buyItem(uint256 _id) public payable returns(bool){

    Item memory item = items[_id];
    if( msg.value < item.valor )revert();

    if(block.timestamp < ventaPublica)revert();

    Investor memory usuario = investors[_msgSender()];
    
    if ( usuario.baneado)revert("estas baneado");
    
    inventario[_msgSender()].push(item);
    ingresos += item.valor;

    return true;
      
  }

   function buyCoins() public payable returns(bool){

    Investor storage usuario = investors[_msgSender()];

    if (usuario.baneado)revert("estas baneado");
  
    usuario.balance += msg.value;
    ingresos += msg.value;

    return true;
    
  }

  function sellCoins(uint256 _value) public returns (bool) {
      Investor storage usuario = investors[_msgSender()];

      if (usuario.baneado)revert("estas baneado");
      if (_value > usuario.balance)revert();

      if (address(this).balance < _value) revert("no hay balance para transferir");
      if (payable(_msgSender()).send(_value))
          revert("fallo la transferencia");

      usuario.balance -= _value;
      retiros += _value;

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

  function addOption(string memory _tipo, bool _ilimitado, uint256 _cantidad) public onlyOwner returns(bool) {

    opciones.push(
      Tipos({
        tipo : _tipo,
        ilimitados: _ilimitado,
        cantidad: _cantidad
      })
    );
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

  function editOption(uint256 _id, string memory _tipo, bool _ilimitado, uint256 _cantidad) public onlyOwner returns(bool) {

    opciones[_id] = 
      Tipos({
        tipo : _tipo,
        ilimitados: _ilimitado,
        cantidad: _cantidad
      });
    return true;

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
  
  function largoOptions() public view returns(uint256){

    return opciones.length;
      
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
  
  function ChangePrincipalToken(address _tokenERC20) public onlyOwner returns (bool){

    OTRO_Contract = TRC20_Interface(_tokenERC20);
    token = _tokenERC20;

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

  function redimETH() public onlyOwner returns (bool){

    if ( address(this).balance <= 0)revert();

    return owner.send(address(this).balance);

  }

}