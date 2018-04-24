# Crypto Rock Paper and Scissors

## Installation
```
docker-compose run --rm --service-ports truffle-games /bin/bash #run games
```

## run
```
docker-compose run --rm --service-ports truffle-games /bin/bash #run games
truffle develop
truffle compile
truffle migrate
npm run dev
```

## Test
```
truffle test
```

### The Game
This a simple "Rock, Paper and Scissors" game. And this are the steps to play it:
- (player 1) Creates game and a deposit of 0.2 ethers is made. 0.1 ether is the bet. And the other 0.1 ether is the escrow deposit to discourage players from not finishing the game.
- (Player 2) join the game and makes the same deposit.
- (Player 1 and 2) post their encripted number.
- (Player 1 and 2) post their decrypted moves (the should match the original encripted ones).
- (Player 1 and 2) Ones both players has decripted their moves, they can withdraw their scrow deposits and the reward in the case of the winner.
