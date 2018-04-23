import Vue from 'vue'
import App from './app.vue'

// Import the page's CSS. Webpack will know what to do with it.
import "../stylesheets/app.css";

// Import libraries we need.
import { default as Web3} from 'web3';
import { default as contract } from 'truffle-contract'

// Import our contract artifacts and turn them into usable abstractions.
import multi_rps_artifacts from '../../build/contracts/MultiRPS.json'

var MultiRPS = contract(multi_rps_artifacts);

new Vue({
  el: '#app',
  data: {
    debug: '',
    account: 0,
    gameId: '',
    joinGameId: '',
    gamesCounter: 0,
    myGames: [],
    availableGames: [],
    closedJoinGames: [],
    game: '',
    move: '',
    pass: '',
    moveEnc: ''
  },
  components: { App },
  methods: {
    _makeMove: function() {
      console.log("Initiating transaction... (please wait)");
      var vm = this;
      var meta;
      console.log('_makeMove', vm.gameId, vm.moveEnc);

      return MultiRPS.deployed().then(function(instance) {
        console.log('first then in _makeMove');
        meta = instance;
        return meta.move(vm.gameId, vm.moveEnc, {from: vm.account});
      }).then(function(result) {
        console.log("Transaction Move complete!", result);
        // Catch GameCreated Event

        vm.getGame();
      }).catch(function(e) {
        console.log(e);
        console.log("Error sending coin; see log.");
      });
    },
    makeMove: function(){
      if(this.move == '' || this.pass == '') {
        alert('You have to enter a pass and choose a move!');
        return;
      }

      var vm = this;
      var meta;
      this.getmoveEnc().then(function(result){
        console.log('then afet getmoveEnc');
        vm._makeMove()

      }
      );
    },
    getmoveEnc: function(){


      console.log("Initiating transaction... (please wait)");
      var vm = this;
      var meta;
      return MultiRPS.deployed().then(function(instance) {
        console.log('first then');
        meta = instance;
        return meta.enc(vm.move, vm.pass, {from: vm.account});
      }).then(function(result) {
        console.log("Transaction complete!", result);
        vm.moveEnc = result;

        // this.move = '';
        // this.pass = '';
        // this.getGame();
      }).catch(function(e) {
        console.log(e);

        console.log("Error sending coin; see log.");
      });
    },
    refresh: function() {
      var vm = this;
      vm.getGamesCounter().then(function() {
          vm.getClosedJoinGames().then(function() {
            vm.getMygames().then(function(){
              vm.gameId = vm.myGames[0];
              vm.getGame().then(function(){
                vm.getAvailableGames();
              });
            });
          });
      });
    },

    getDebug: function() {console.log('debug');},
    getGame: function() {
      var vm = this;
      var meta;
      return MultiRPS.deployed().then(function(instance) {
        var result = instance.getGame.call(vm.gameId, {from: vm.account});
        return result;
      }).then(function(value) {
        // vm.availableGames = value;
        // vm.closedJoinGames = value.filter( ( el ) => !vm.myGames.includes( el ) );
        console.log(value);
        var nullString = '0x0000000000000000000000000000000000000000000000000000000000000000';
        var nullAddress = '0x0000000000000000000000000000000000000000';

        var game =  {
          'player1': value[0],
          'player2': value[1],
          'player1Move': value[2],
          'player1MoveEnc': value[3],
          'player1Pass': value[4],
          'player1Paid': value[5],
          'player2Move': value[6],
          'player2MoveEnc': value[7],
          'player2Pass': value[8],
          'player2Paid': value[9]
        };

        var cleanGame = {};
        if(game.player1 == vm.account) {
          cleanGame['enemy'] = game.player2 != nullAddress ? game.player2 : false;
          cleanGame['enemyMoveEnc'] = game.player2MoveEnc != nullString ? game.player2MoveEnc : false;
          cleanGame['enemyMove'] = game.player2Move != nullString ? game.player2Move : false;
          cleanGame['ownMoveEnc'] = game.player1MoveEnc != nullString ? game.player1MoveEnc : false;
          cleanGame['ownMove'] = game.player1Move != nullString ? game.player1Move : false;
        } else {
          cleanGame['enemy'] = game.player1 != nullAddress ? game.player1 : false;
          cleanGame['enemyMoveEnc'] = game.player1MoveEnc != nullString ? game.player1MoveEnc : false;
          cleanGame['enemyMove'] = game.player1Move != nullString ? game.player1Move : false;
          cleanGame['ownMoveEnc'] = game.player2MoveEnc != nullString ? game.player2MoveEnc : false;
          cleanGame['ownMove'] = game.player2Move != nullString ? game.player2Move : false;
        }
        // debugger;
        vm.game = cleanGame;
      }).catch(function(e) {
        console.log(e);
      });
    },
    getGamesCounter: function() {
      var vm = this;
      var meta;
      return MultiRPS.deployed().then(function(instance) {
        var result = instance.gamesCounter.call({from: vm.account});
        return result;
      }).then(function(value) {
        // vm.availableGames = value;
        // vm.closedJoinGames = value.filter( ( el ) => !vm.myGames.includes( el ) );
        console.log(value);
        vm.gamesCounter = value;
      }).catch(function(e) {
        console.log(e);
      });
    },
    getClosedJoinGames: function() {
      var vm = this;
      var meta;
      return MultiRPS.deployed().then(function(instance) {
        var result = instance.getClosedJoinGames.call({from: vm.account});
        return result;
      }).then(function(value) {
        // vm.availableGames = value;
        // vm.closedJoinGames = value.filter( ( el ) => !vm.myGames.includes( el ) );
        console.log(value);
        vm.closedJoinGames = [];
        for(var i = 0; i < value.length; i++) {
          vm.closedJoinGames.push(value[i].toNumber());
        }

      }).catch(function(e) {
        console.log(e);
      });
    },
    getAvailableGames: function() {
      console.log('getAvailableGames');
      var vm = this;
      var games = [];
      for (var i=0; i < vm.gamesCounter; i++) {
          games.push(i);
      }
      games = games.filter( function( el ) { return vm.closedJoinGames.indexOf( el ) < 0;});
      games = games.filter( function( el ) { return vm.myGames.indexOf( el ) < 0;});
      vm.availableGames = games;
    },
    getMygames: function() {
      var vm = this;
      var meta;
      return MultiRPS.deployed().then(function(instance) {
        console.log('first then');
        var result = instance.getPlayerGames.call(vm.account, {from: vm.account});
        return result;
      }).then(function(value) {
        console.log('second then');
        vm.myGames = [];
        for (var i=0; i < value.length; i++) {
            vm.myGames.push(value[i].toNumber());
        }
      }).catch(function(e) {
        console.log(e);
      });
    },
    getAccount: function() {
      var vm = this;

      // Get the initial account balance so it can be displayed.
      web3.eth.getAccounts(function(err, accs) {
        if (err != null) {
          alert("There was an error fetching your accounts.");
          return;
        }
        if (accs.length == 0) {
          alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.");
          return;
        }
        vm.account = accs[0];
      });
    },
    createGame: function() {
      var vm = this;
      console.log("Initiating transaction... (please wait)");

      var meta;
      return MultiRPS.deployed().then(function(instance) {
        console.log('first then');
        meta = instance;
        return meta.createGame({from: vm.account, value: web3.toWei(2, 'ether')});
      }).then(function(result) {
        console.log("Transaction complete!", result);

        // Catch GameCreated Event
        for (var i = 0; i < result.logs.length; i++) {
          var log = result.logs[i];

          if (log.event == "GameCreated") {
            vm.gameId = log.args.gameId.valueOf();
            break;
          }
        }
        vm.refresh();
      }).catch(function(e) {
        console.log(e);
        console.log("Error sending coin; see log.");
      });
    },
    joinGame: function() {
      console.log("Initiating transaction... (please wait)");
      var vm = this;
      var meta;
      return MultiRPS.deployed().then(function(instance) {
        console.log('first then');
        meta = instance;
        return meta.joinGame(vm.joinGameId, {from: vm.account, value: web3.toWei(2, 'ether')});
      }).then(function(result) {
        console.log("Transaction complete!", result);
        // Catch GameCreated Event
        for (var i = 0; i < result.logs.length; i++) {
          var log = result.logs[i];
          if (log.event == "GameJoined") {
            vm.gameId = log.args.gameId.valueOf();
            break;
          }
        }
        vm.refresh();
      }).catch(function(e) {
        console.log(e);
        console.log("Error sending coin; see log.");
      });
    }
  },
  created : function() {
    MultiRPS.setProvider(web3.currentProvider);
    console.log('provider set');
    this.getAccount();
    this.refresh();
  }
})
