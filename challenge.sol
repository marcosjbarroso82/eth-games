pragma solidity ^0.4.19;

contract Challenge {
  event Log(string msg);

  address public player1;
  address public player2;
  
  uint public player1Move;
  uint public player2Move;
  
  uint numberOfPlayers;
  uint numberOfMoves = 1;
  
  uint public turn;
  uint public bet = 1 ether;
  
  modifier isPlayer(address _player) {
    require(_player == player1 || _player == player2);
    _;
  }
  
  modifier isValidTurn(address _player) {
    // check all players in  
    require(player1 != address(0) && player2 != address(0));
    // check right turn
    if(_player == player1 && turn % numberOfPlayers != 0 ||
        _player == player2 && turn % numberOfPlayers != 1){
        revert("it is not your turn!");
    }
    _;
  }

  modifier isValidMove(uint _move) {
      require(_move > 0 && _move < 10);
      _;
  }

  function getGameStatus() public view returns(string){
      if(player1 == address(0) || player2 == address(0)) {
          return 'pending';
      }
      if(player1Move != 0 && player2Move != 0) {
          return 'finished';
      }
      return 'initialized';
  }

  function getWinner() public view returns(address){
      if(keccak256(getGameStatus()) == keccak256('finished')) {
          if (player1Move >= player2Move) {
            return player1;   
          } else {
            return player2;
          }
      } else {
          return address(0);
      }
  }

  function move(uint _move) external 
    isPlayer(msg.sender) 
    isValidMove(_move)
    isValidTurn(msg.sender){
      if(msg.sender == player1) {
          player1Move = _move;
      } else {
          player2Move = _move;
      }
      turn++;
      
      // check result
      if(keccak256(getGameStatus()) == keccak256('finished')){
          // game has ended
          // TODO: Implement Reward
          address winner = getWinner();
          winner.transfer(address(this).balance);
      }
  }
  
  function reset() internal {
      player1 = address(0);
      player2 = address(0);
      
      player1Move = 0;
      player2Move = 0;
      
      numberOfPlayers = 0;
      turn = 0;
  }

  function joinGame() external payable {
    require(msg.value == bet);
    if (player1 == address(0)) {
      player1 = msg.sender;
      emit Log("player1 - joined");
    } else {
      require(msg.sender != player1);
      player2 = msg.sender;
      emit Log("player2 - joined");
    }
    numberOfPlayers++;
  }
}
