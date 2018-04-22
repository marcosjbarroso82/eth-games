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
    myGames: [],
    availableGames: []
  },
  components: { App },
  methods: {
    getDebug: function() {console.log('debug');},
    getAvailableGames: function() {
      var vm = this;
      var meta;
      MultiRPS.deployed().then(function(instance) {
        var result = instance.getAvailableGames.call({from: vm.account});
        return result;
      }).then(function(value) {
        // vm.availableGames = value;
        vm.availableGames = value.filter( ( el ) => !vm.myGames.includes( el ) );
      }).catch(function(e) {
        console.log(e);
      });
    },
    getMygames: function() {
      var vm = this;
      var meta;
      MultiRPS.deployed().then(function(instance) {
        console.log('first then');
        var result = instance.getPlayerGames.call(vm.account, {from: vm.account});
        // debugger;
        return result;
      }).then(function(value) {
        console.log('second then');
        vm.myGames = value;
      }).catch(function(e) {
        // debugger;
        console.log(e);
      });
    },
    getAccount: function() {
      var mv = this;

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
        mv.account = accs[0];

      });
    },
    createGame: function() {
      var mv = this;
      console.log("Initiating transaction... (please wait)");

      var meta;
      MultiRPS.deployed().then(function(instance) {
        console.log('first then');
        meta = instance;
        return meta.createGame({from: mv.account, value: web3.toWei(2, 'ether')});
      }).then(function(result) {
        console.log("Transaction complete!", result);

        // Catch GameCreated Event
        for (var i = 0; i < result.logs.length; i++) {
          var log = result.logs[i];

          if (log.event == "GameCreated") {
            mv.gameId = log.args.gameId.valueOf();
            break;
          }
        }

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
    this.getMygames();
    this.getAvailableGames();
  }
})
