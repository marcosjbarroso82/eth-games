pragma solidity ^0.4.19;

contract Challenge {
  event Log(string msg);
  event LogB(bytes32 msg);
  struct Game {
    address player1;
    address player2;
    
    bytes32 player1Move;
    bytes32 player1MoveEnc;
    bytes32 player1Pass;
    bool player1Paid;
    
    bytes32 player2Move;
    bytes32 player2MoveEnc;
    bytes32 player2Pass;
    bool player2Paid;
  }
  Game[] public games;

  uint private bet = 1 ether;
  uint private escrow = 1 ether;
  uint private numberOfMoves;
  uint private numberOfPlayers = 2;
  /*
  constructor() public{
      dummyCreateGame();
  }
  */
  function log(string _msg) private {
      emit Log(_msg);
  }
  
  function logB(bytes32 _msg) private {
      emit LogB(_msg);
  }

  modifier isPlayer(uint _gameId) {
    require(msg.sender == games[_gameId].player1 || msg.sender == games[_gameId].player2);
    _;
  }

  modifier isValidMove(bytes32 _move) {
      //require(_move == 'r' || _move == 'p' || _move == 's');
      _;
  }

  function getWinner(uint _gameId) public view returns(address){
      if(games[_gameId].player1Move != 0x0 && games[_gameId].player2Move != 0x0) {
          if(games[_gameId].player1Move == games[_gameId].player2Move){
              // draw
              return address(0);
          }
          
          if(games[_gameId].player1Move == 'r' && games[_gameId].player1Move == 's'
            || games[_gameId].player1Move == 's' && games[_gameId].player1Move == 'p'
            || games[_gameId].player1Move == 'p' && games[_gameId].player1Move == 'r'){
                return games[_gameId].player1;
            } else {
                return games[_gameId].player2;
            }
      }
      return address(0);
  }

  function move(uint _gameId, bytes32 _moveEnc) external isPlayer(_gameId)
    isValidMove(_moveEnc){
      if(msg.sender == games[_gameId].player1) {
          games[_gameId].player1MoveEnc = _moveEnc;
      } else {
          games[_gameId].player2MoveEnc = _moveEnc; 
      }
  }
  
  function decriptMove(uint _gameId, bytes32 _move, bytes32 _pass) external 
    isPlayer(_gameId){
    //   Game memory game = games[_gameId];
      
      if(msg.sender == games[_gameId].player1) {
          log('player1');
          require(games[_gameId].player1MoveEnc != 0x0);
          log('your moveEnc is not empty');
          if(games[_gameId].player1MoveEnc != enc(_move, _pass)){
              log('you pass and move are wrong');
              logB(_move);
              logB(_pass);
              logB(games[_gameId].player1MoveEnc);
              
          }
          require(games[_gameId].player1MoveEnc == enc(_move, _pass));
          games[_gameId].player1Move = _move;
          games[_gameId].player1Pass = _pass;
          
      } else {
          require(games[_gameId].player2MoveEnc != 0x0);
          require(games[_gameId].player2MoveEnc == enc(_move, _pass));
          games[_gameId].player2Move = _move;
          games[_gameId].player2Pass = _pass;
      }
  }
  

   
  function withdraw(uint _gameId) public isPlayer(_gameId){
    // Check game has finished  
    require(games[_gameId].player1Move != 0x0 && games[_gameId].player2Move != 0x0);
    
    // check if user has already been paid. Mark as 'paid' if it hasn't already
    if(msg.sender == games[_gameId].player1) {
        require(!games[_gameId].player1Paid);
        games[_gameId].player1Paid = true;
    } 
    if(msg.sender == games[_gameId].player2 && !games[_gameId].player2Paid) {
        require(!games[_gameId].player2Paid);
        games[_gameId].player2Paid = true;
    }
    
    // transfer ethers
    if(msg.sender == getWinner(_gameId)){  // winner
        msg.sender.transfer(2 * bet + escrow);
    } else {
        if(getWinner(_gameId) == address(0)) { // draw
            msg.sender.transfer(bet + escrow);
        } else { // looser
            msg.sender.transfer(escrow);    
        }
    }
  }


  function createGame() external payable returns(uint){
    require(msg.value == bet + escrow);
    Game memory game = Game(msg.sender, address(0), '', '', '', false, '', '', '', false);
    uint gameId = games.push(game) - 1;
    return gameId;
  }

  function dummyCreateGame() private returns(uint){
    Game memory game = Game(0xca35b7d915458ef540ade6068dfe2f44e8fa733c,
    0x14723a09acff6d2a60dcdf7aa4aff308fddc160c, '', '', '', false, '', '', '', false);
    uint gameId = games.push(game) - 1;
    return gameId;
  }

  function joinGame(uint _gameId) external payable {
    require(msg.value == bet + escrow);
    // Check user doesn't play against itself
    require(games[_gameId].player1 != msg.sender);
    games[_gameId].player2 = msg.sender;
  }
  
 
  
  function enc(bytes32 _value, bytes32 _pass) public pure returns(bytes32){
      return keccak256(_value, _pass);
  }
  
  
}
