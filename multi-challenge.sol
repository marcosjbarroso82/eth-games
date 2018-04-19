pragma solidity ^0.4.19;

contract Challenge {
  event Log(string msg);

  struct Game {
    address player1;
    address player2;
    uint player1Move;
    uint player2Move;
    uint turn;
  }
  Game[] public games;

  uint public bet = 1 ether;
  uint public numberOfMoves;
  uint public numberOfPlayers = 2;

  modifier isPlayer(uint _gameId, address _player) {
    require(_player == games[_gameId].player1 || _player == games[_gameId].player2);
    _;
  }

  modifier isValidTurn(uint _gameId, address _player) {
    // check all players in
    require(games[_gameId].player1 != address(0) && games[_gameId].player2 != address(0));
    // check right turn
    if(_player == games[_gameId].player1 && games[_gameId].turn % numberOfPlayers != 0 ||
        _player == games[_gameId].player2 && games[_gameId].turn % numberOfPlayers != 1){
        revert("it is not your turn!");
    }
    _;
  }

  modifier isValidMove(uint _move) {
      require(_move > 0 && _move < 10);
      _;
  }

  function getGameStatus(uint _gameId) public view returns(string){
      if(games[_gameId].player1 == address(0) || games[_gameId].player2 == address(0)) {
          return 'pending';
      }
      if(games[_gameId].player1Move != 0 && games[_gameId].player2Move != 0) {
          return 'finished';
      }
      return 'initialized';
  }

  function getWinner(uint _gameId) public view returns(address){
      if(keccak256(getGameStatus(_gameId)) == keccak256('finished')) {
          if (games[_gameId].player1Move >= games[_gameId].player2Move) {
            return games[_gameId].player1;
          } else {
            return games[_gameId].player2;
          }
      } else {
          return address(0);
      }
  }

  function move(uint _gameId, uint _move) external
    isPlayer(_gameId, msg.sender)
    isValidMove(_move)
    isValidTurn(_gameId, msg.sender){
      if(msg.sender == games[_gameId].player1) {
          games[_gameId].player1Move = _move;
      } else {
          games[_gameId].player2Move = _move;
      }
      games[_gameId].turn++;

      // check result
      if(keccak256(getGameStatus(_gameId)) == keccak256('finished')){
          // game has ended
          // TODO: Implement Reward
          address winner = getWinner(_gameId);
          winner.transfer(address(this).balance);
      }
  }

  function reset(uint _gameId) internal {
      games[_gameId].player1 = address(0);
      games[_gameId].player2 = address(0);
      games[_gameId].player1Move = 0;
      games[_gameId].player2Move = 0;
      games[_gameId].turn = 0;
  }

  function createGame() external payable returns(uint){
    require(msg.value == bet);
    Game memory game = Game(msg.sender, address(0), 0, 0, 0);
    uint gameId = games.push(game) - 1;
    return gameId;
  }

  function joinGame(uint _gameId) external payable {
    require(msg.value == bet);
    require(games[_gameId].player1 != msg.sender);
    games[_gameId].player2 = msg.sender;
  }
}
