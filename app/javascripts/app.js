import Vue from 'vue'
import App from './app.vue'

// Import the page's CSS. Webpack will know what to do with it.
import "../stylesheets/app.css";

// Import libraries we need.
import { default as Web3} from 'web3';
import { default as contract } from 'truffle-contract'

// Import our contract artifacts and turn them into usable abstractions.
import metacoin_artifacts from '../../build/contracts/MetaCoin.json'

// MetaCoin is our usable abstraction, which we'll use through the code below.
var MetaCoin = contract(metacoin_artifacts);


new Vue({
  el: '#app',
  data: {
    balance,
    account: 0,
    coinToSend: 1,
    receiver: '0x5c7E722F51cc316fe74C9AF95e7309c4368366c4'
  },
  components: { App },
  methods: {
    getBalance: function() {
      var vm = this;
      var meta;
      MetaCoin.deployed().then(function(instance) {
        var result = instance.getBalance.call(vm.account, {from: vm.account});
        return result;
      }).then(function(value) {
        vm.balance = value.valueOf();
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
    sendCoins: function() {
      var mv = this;
      console.log("Initiating transaction... (please wait)");

      var meta;
      MetaCoin.deployed().then(function(instance) {
        meta = instance;
        return meta.sendCoin(mv.receiver, mv.amount, {from: mv.account});
      }).then(function() {
        console.log("Transaction complete!");
        setTimeout(function () {
          mv.getBalance();
        }, 2000);

      }).catch(function(e) {
        console.log(e);
        console.log("Error sending coin; see log.");
      });
    }
  },
  created : function() {
    MetaCoin.setProvider(web3.currentProvider);
    console.log('provider set');
    this.getAccount();
    this.getBalance();
  }
})
