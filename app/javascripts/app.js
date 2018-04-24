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
    showDebug: false,
    debug: '',
    account: 0,
    gameId: '',
    joinGameId: '',
    games: [],
    gamesCounter: 0,
    myGames: [],
    availableGames: [],
    closedJoinGames: [],
    game: '',
    move: '',
    pass: 'betterNoChange',
    moveEnc: ''
  },
  components: { App },
  watch: {
  months: function (gameId) {
    alert(gameId);
  }
},
  methods: {
    refresh: function() {
      this.getGames().then(() => {
        this.getMygames().then(() => {
          this.getAvailableGames();
          this.getGame();
        });
      });
    },
    getGames: function(){
      var vm = this;
      var games = [];
      return vm.getGamesCounter().then(function(){
        for (var i=0; i < vm.gamesCounter; i++) {
            games.push(i);
        }
        vm.games = games;
      });

    },
    withdraw: function() {
      var vm = this;
      var meta;

      return MultiRPS.deployed().then(function(instance) {
        meta = instance;
        return meta.withdraw(vm.gameId, {from: vm.account});
      }).then(function(result) {
        vm.getGame();
      }).catch(function(e) {
        console.log(e);
      });
    },
    _makeMove: function() {
      console.log('_makeMove');
      var vm = this;
      var meta;

      return MultiRPS.deployed().then(function(instance) {
        meta = instance;
        return meta.move(vm.gameId, vm.moveEnc, {from: vm.account});
      }).catch(function(e) {
        console.log(e);
      });
    },
    decriptMove: function() {
      var vm = this;
      var meta;
      // check the pass and move are correct!
      return MultiRPS.deployed().then(function(instance) {
        meta = instance;
        return meta.enc(vm.move, vm.pass, {from: vm.account});
      }).then(function(result) {
        vm.moveEnc = result;

        if(vm.moveEnc != vm.game.ownMoveEnc) {
          alert('the pass and move do not match');
        } else {
          // alert('coinciden... las habria enviado!')
          MultiRPS.deployed().then(function(instance) {
            meta = instance;
            return meta.decriptMove(vm.gameId, vm.move, vm.pass, {from: vm.account});
          }).then(function(result) {
            setTimeout(function () {
              vm.getGame();
            }, 1000);
          }).catch(function(e) {
            console.log(e);
          });
        }
      }).catch(function(e) {
        console.log(e);
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
        console.log(87);
        vm._makeMove().then(function(res){
          console.log(res);
          setTimeout(function () {
            vm.getGame();
          }, 1000);
        });
      });
    },
    getmoveEnc: function(){
      console.log('getmoveEnc');
      var vm = this;
      var meta;
      return MultiRPS.deployed().then(function(instance) {
        meta = instance;
        return meta.enc(vm.move, vm.pass, {from: vm.account});
      }).then(function(result) {
        vm.moveEnc = result;
      }).catch(function(e) {
        console.log(e);
      });
    },
    getDebug: function() {console.log('debug');},
    getGame: function() {
      // console.log('getGame');
      var vm = this;
      var meta;

      // if((vm.gameId == undefined || vm.gameId == '') && vm.myGames.length > 0) {
      //   vm.gameId = vm.myGames[0];
      // }

      if(this.gameId != '' && this.gameId != undefined){
        console.log('gameId', this.gameId);

        return MultiRPS.deployed().then(function(instance) {
          var result = instance.getGame.call(vm.gameId, {from: vm.account});
          return result;
        }).then(function(value) {
          var nullString = '0x0000000000000000000000000000000000000000000000000000000000000000';
          var nullAddress = '0x0000000000000000000000000000000000000000';
          console.log(value);
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
          // console.log(game);

          var cleanGame = {};
          if(game.player1 == vm.account) {
            cleanGame['enemy'] = game.player2 != nullAddress ? game.player2 : false;
            cleanGame['enemyMoveEnc'] = game.player2MoveEnc != nullString ? game.player2MoveEnc : false;
            cleanGame['enemyMove'] = game.player2Move != nullString ? game.player2Move : false;
            cleanGame['ownMoveEnc'] = game.player1MoveEnc != nullString ? game.player1MoveEnc : false;
            cleanGame['ownMove'] = game.player1Move != nullString ? game.player1Move : false;
            cleanGame['paid'] = game.player1Paid != nullString ? game.player1Paid : false;
          } else {
            cleanGame['enemy'] = game.player1 != nullAddress ? game.player1 : false;
            cleanGame['enemyMoveEnc'] = game.player1MoveEnc != nullString ? game.player1MoveEnc : false;
            cleanGame['enemyMove'] = game.player1Move != nullString ? game.player1Move : false;
            cleanGame['ownMoveEnc'] = game.player2MoveEnc != nullString ? game.player2MoveEnc : false;
            cleanGame['ownMove'] = game.player2Move != nullString ? game.player2Move : false;
            cleanGame['paid'] = game.player2Paid != nullString ? game.player2Paid : false;

          }
          vm.game = cleanGame;
        }).catch(function(e) {
          console.log(e);
        });
      }
    },
    getGamesCounter: function() {
      var vm = this;
      var meta;
      return MultiRPS.deployed().then(function(instance) {
        var result = instance.gamesCounter.call({from: vm.account});
        return result;
      }).then(function(value) {
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
        vm.closedJoinGames = [];
        for(var i = 0; i < value.length; i++) {
          vm.closedJoinGames.push(value[i].toNumber());
        }

      }).catch(function(e) {
        console.log(e);
      });
    },
    getAvailableGames: function() {
      var vm = this;
      var games = [];
      for (var i=0; i < vm.gamesCounter; i++) {
          games.push(i);
      }
      games = games.filter( function( el ) { return vm.closedJoinGames.indexOf( el ) < 0;});
      games = games.filter( function( el ) { return vm.myGames.indexOf( el ) < 0;});
      vm.availableGames = games;
      if(vm.gameId == '' && vm.availableGames.length > 0){
          vm.gameId = vm.myGames[0];
      }
      else {
        console.log('no hay juegos', vm.gameId, vm.availableGames.length);
      }
    },
    getMygames: function() {
      var vm = this;
      var meta;
      return MultiRPS.deployed().then(function(instance) {
        return instance.getPlayerGames.call(vm.account, {from: vm.account});
      }).then(function(value) {
        vm.myGames = [];
        for (var i=0; i < value.length; i++) {
            vm.myGames.push(value[i].toNumber());
        }

        if((vm.gameId == undefined || vm.gameId == '') && vm.myGames.length > 0) {
          vm.gameId = vm.myGames[0];
        }
      }).catch(function(e) {
        console.log(e);
      });
    },
    getAccount: function() {
      this.account = web3.eth.accounts[0];
    },
    createGame: function() {
      var vm = this;
      var meta;
      return MultiRPS.deployed().then(function(instance) {
        meta = instance;
        return meta.createGame({from: vm.account, value: web3.toWei(0.2, 'ether')});
      }).then(function(result) {
        // Catch GameCreated Event
        for (var i = 0; i < result.logs.length; i++) {
          var log = result.logs[i];

          if (log.event == "GameCreated") {
            vm.gameId = log.args.gameId.valueOf();
            console.log('change to game created', vm.gameId);
            break;
          }
        }
        setTimeout(function () {
          vm.refresh();
          vm.getGame();
        }, 1000);
      }).catch(function(e) {
        console.log(e);
      });
    },
    joinGame: function() {
      var vm = this;
      var meta;
      return MultiRPS.deployed().then(function(instance) {
        meta = instance;
        return meta.joinGame(vm.joinGameId, {from: vm.account, value: web3.toWei(0.2, 'ether')});
      }).then(function(result) {
        // Catch GameCreated Event
        for (var i = 0; i < result.logs.length; i++) {
          var log = result.logs[i];
          if (log.event == "GameJoined") {
            vm.gameId = log.args.gameId.valueOf();
            break;
          }
        }
        vm.gameId = vm.joinGameId;
        setTimeout(function () {
          vm.refresh();
          vm.getGame();
        }, 1000);
      }).catch(function(e) {
        console.log(e);
      });
    }
  },
  created : function() {
    var vm = this;
    if (typeof web3 !== 'undefined') {
      // Use Mist/MetaMask's provider
      MultiRPS.setProvider(web3.currentProvider);
      this.getAccount();
      this.refresh();

      setInterval(function () {
        var account = web3.eth.accounts[0];
        if( account !== vm.account) {
          console.log('account changed', vm.account, account);
          vm.account = account;
          vm.gameId = '';
          vm.refresh();
        }
      }, 1000);

      setInterval(function () {
        vm.getGame();
      }, 3000);
    } else {
      alert('Use mist and metamask and reload the page!')
    }


    // this.getAccount();
    // this.refresh();
  },
  mounted: function() {
    var vm = this;

  }
})
