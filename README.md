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

### Notes
- The game updates it's status every 3 seconds. So, give it time.

### The Game
This a simple "Rock, Paper and Scissors" game. And these are the steps to play it:
- (player 1) Creates game and a deposit of 0.2 ethers is made. 0.1 ether is the bet. And the other 0.1 ether is the escrow deposit to discourage players from not finishing the game.
- (Player 2) join the game and makes the same deposit.
- (Player 1 and 2) post their encrypted moves. They are encrypted so the other player can't cheat by checking the adversary move before makings it's own.
- (Player 1 and 2) post their decrypted moves (they should match the original encrypted ones).
- (Player 1 and 2) Once both players has decrypted their moves, they can withdraw their escrow deposits and the reward in the case of the winner.

### TODO
- Properly implement Vuejs
- Improve UX
- Use solidity logs to return values in transactions so We don't have to fetch for update and improve UX.
