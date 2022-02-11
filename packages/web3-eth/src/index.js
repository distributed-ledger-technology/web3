/*
 This file is part of web3.js.

 web3.js is free software: you can redistribute it and/or modify
 it under the terms of the GNU Lesser General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 web3.js is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU Lesser General Public License for more details.

 You should have received a copy of the GNU Lesser General Public License
 along with web3.js.  If not, see <http://www.gnu.org/licenses/>.
 */
/**
 * @file index.js
 * @author Fabian Vogelsteller <fabian@ethereum.org>
 * @date 2017
 */

'use strict';

import core from 'https://deno.land/x/web3@v0.9.2/packages/web3-core/src/index.js';
import * as helpers from 'https://deno.land/x/web3@v0.9.2/packages/web3-core-helpers/src/index.js';
import { subscriptions as Subscriptions } from 'https://deno.land/x/web3@v0.9.2/packages/web3-core-subscriptions/src/index.js';
import Method from 'https://deno.land/x/web3@v0.9.2/packages/web3-core-method/src/index.js';
import utils from 'https://deno.land/x/web3@v0.9.2/packages/web3-utils/src/index.js';
import Net from 'https://deno.land/x/web3@v0.9.2/packages/web3-net/src/index.js';
import ENS from 'https://deno.land/x/web3@v0.9.2/packages/web3-eth-ens/src/index.js';
import Personal from 'https://deno.land/x/web3@v0.9.2/packages/web3-eth-personal/src/index.js';
import BaseContract from 'https://deno.land/x/web3@v0.9.2/packages/web3-eth-contract/src/index.js';
import Iban from 'https://deno.land/x/web3@v0.9.2/packages/web3-eth-iban/src/index.js';
import Accounts from 'https://deno.land/x/web3@v0.9.2/packages/web3-eth-accounts/src/index.js';
import abi from 'https://deno.land/x/web3@v0.9.2/packages/web3-eth-abi/src/index.js';
import getNetworkType from './getNetworkType.js';

const formatter = helpers.formatters;

const blockCall = function (args) {
  return (typeof args[0] === 'string' && args[0].indexOf('0x') === 0) ? 'eth_getBlockByHash' : 'eth_getBlockByNumber';
};

const transactionFromBlockCall = function (args) {
  return (typeof args[0] === 'string' && args[0].indexOf('0x') === 0) ? 'eth_getTransactionByBlockHashAndIndex' : 'eth_getTransactionByBlockNumberAndIndex';
};

const uncleCall = function (args) {
  return (typeof args[0] === 'string' && args[0].indexOf('0x') === 0) ? 'eth_getUncleByBlockHashAndIndex' : 'eth_getUncleByBlockNumberAndIndex';
};

const getBlockTransactionCountCall = function (args) {
  return (typeof args[0] === 'string' && args[0].indexOf('0x') === 0) ? 'eth_getBlockTransactionCountByHash' : 'eth_getBlockTransactionCountByNumber';
};

const uncleCountCall = function (args) {
  return (typeof args[0] === 'string' && args[0].indexOf('0x') === 0) ? 'eth_getUncleCountByBlockHash' : 'eth_getUncleCountByBlockNumber';
};

const Eth = function Eth() {
  const _this = this;

  // sets _requestmanager
  core.packageInit(this, arguments);

  // overwrite package setRequestManager
  const { setRequestManager } = this;
  this.setRequestManager = function (manager) {
    setRequestManager(manager);

    _this.net.setRequestManager(manager);
    _this.personal.setRequestManager(manager);
    _this.accounts.setRequestManager(manager);
    _this.Contract._requestManager = _this._requestManager;
    _this.Contract.currentProvider = _this._provider;

    return true;
  };

  // overwrite setProvider
  const { setProvider } = this;
  this.setProvider = function () {
    setProvider.apply(_this, arguments);

    _this.setRequestManager(_this._requestManager);

    // Set detectedAddress/lastSyncCheck back to null because the provider could be connected to a different chain now
    _this.ens._detectedAddress = null;
    _this.ens._lastSyncCheck = null;
  };

  let handleRevert = false;
  let defaultAccount = null;
  let defaultBlock = 'latest';
  let transactionBlockTimeout = 50;
  let transactionConfirmationBlocks = 24;
  let transactionPollingTimeout = 750;
  let transactionPollingInterval = 1000;
  let blockHeaderTimeout = 10; // 10 seconds
  let maxListenersWarningThreshold = 100;
  let defaultChain; let defaultHardfork; let 
    defaultCommon;

  Object.defineProperty(this, 'handleRevert', {
    get() {
      return handleRevert;
    },
    set(val) {
      handleRevert = val;

      // also set on the Contract object
      _this.Contract.handleRevert = handleRevert;

      // update handleRevert
      methods.forEach((method) => {
        method.handleRevert = handleRevert;
      });
    },
    enumerable: true,
  });
  Object.defineProperty(this, 'defaultCommon', {
    get() {
      return defaultCommon;
    },
    set(val) {
      defaultCommon = val;

      // also set on the Contract object
      _this.Contract.defaultCommon = defaultCommon;

      // update defaultBlock
      methods.forEach((method) => {
        method.defaultCommon = defaultCommon;
      });
    },
    enumerable: true,
  });
  Object.defineProperty(this, 'defaultHardfork', {
    get() {
      return defaultHardfork;
    },
    set(val) {
      defaultHardfork = val;

      // also set on the Contract object
      _this.Contract.defaultHardfork = defaultHardfork;

      // update defaultBlock
      methods.forEach((method) => {
        method.defaultHardfork = defaultHardfork;
      });
    },
    enumerable: true,
  });
  Object.defineProperty(this, 'defaultChain', {
    get() {
      return defaultChain;
    },
    set(val) {
      defaultChain = val;

      // also set on the Contract object
      _this.Contract.defaultChain = defaultChain;

      // update defaultBlock
      methods.forEach((method) => {
        method.defaultChain = defaultChain;
      });
    },
    enumerable: true,
  });
  Object.defineProperty(this, 'transactionPollingTimeout', {
    get() {
      return transactionPollingTimeout;
    },
    set(val) {
      transactionPollingTimeout = val;

      // also set on the Contract object
      _this.Contract.transactionPollingTimeout = transactionPollingTimeout;

      // update defaultBlock
      methods.forEach((method) => {
        method.transactionPollingTimeout = transactionPollingTimeout;
      });
    },
    enumerable: true,
  });
  Object.defineProperty(this, 'transactionPollingInterval', {
    get() {
      return transactionPollingInterval;
    },
    set(val) {
      transactionPollingInterval = val;

      // also set on the Contract object
      _this.Contract.transactionPollingInterval = transactionPollingInterval;

      // update defaultBlock
      methods.forEach((method) => {
        method.transactionPollingInterval = transactionPollingInterval;
      });
    },
    enumerable: true,
  });
  Object.defineProperty(this, 'transactionConfirmationBlocks', {
    get() {
      return transactionConfirmationBlocks;
    },
    set(val) {
      transactionConfirmationBlocks = val;

      // also set on the Contract object
      _this.Contract.transactionConfirmationBlocks = transactionConfirmationBlocks;

      // update defaultBlock
      methods.forEach((method) => {
        method.transactionConfirmationBlocks = transactionConfirmationBlocks;
      });
    },
    enumerable: true,
  });
  Object.defineProperty(this, 'transactionBlockTimeout', {
    get() {
      return transactionBlockTimeout;
    },
    set(val) {
      transactionBlockTimeout = val;

      // also set on the Contract object
      _this.Contract.transactionBlockTimeout = transactionBlockTimeout;

      // update defaultBlock
      methods.forEach((method) => {
        method.transactionBlockTimeout = transactionBlockTimeout;
      });
    },
    enumerable: true,
  });
  Object.defineProperty(this, 'blockHeaderTimeout', {
    get() {
      return blockHeaderTimeout;
    },
    set(val) {
      blockHeaderTimeout = val;

      // also set on the Contract object
      _this.Contract.blockHeaderTimeout = blockHeaderTimeout;

      // update defaultBlock
      methods.forEach((method) => {
        method.blockHeaderTimeout = blockHeaderTimeout;
      });
    },
    enumerable: true,
  });
  Object.defineProperty(this, 'defaultAccount', {
    get() {
      return defaultAccount;
    },
    set(val) {
      if (val) {
        defaultAccount = utils.toChecksumAddress(formatter.inputAddressFormatter(val));
      }

      // also set on the Contract object
      _this.Contract.defaultAccount = defaultAccount;
      _this.personal.defaultAccount = defaultAccount;

      // update defaultBlock
      methods.forEach((method) => {
        method.defaultAccount = defaultAccount;
      });

      return val;
    },
    enumerable: true,
  });
  Object.defineProperty(this, 'defaultBlock', {
    get() {
      return defaultBlock;
    },
    set(val) {
      defaultBlock = val;
      // also set on the Contract object
      _this.Contract.defaultBlock = defaultBlock;
      _this.personal.defaultBlock = defaultBlock;

      // update defaultBlock
      methods.forEach((method) => {
        method.defaultBlock = defaultBlock;
      });

      return val;
    },
    enumerable: true,
  });
  Object.defineProperty(this, 'maxListenersWarningThreshold', {
    get() {
      return maxListenersWarningThreshold;
    },
    set(val) {
      if (_this.currentProvider && _this.currentProvider.setMaxListeners) {
        maxListenersWarningThreshold = val;
        _this.currentProvider.setMaxListeners(val);
      }
    },
    enumerable: true,
  });

  this.clearSubscriptions = _this._requestManager.clearSubscriptions.bind(_this._requestManager);

  this.removeSubscriptionById = _this._requestManager.removeSubscription.bind(_this._requestManager);

  // add net
  this.net = new Net(this);
  // add chain detection
  this.net.getNetworkType = getNetworkType.bind(this);

  // add accounts
  this.accounts = new Accounts(this);

  // add personal
  this.personal = new Personal(this);
  this.personal.defaultAccount = this.defaultAccount;

  // set warnings threshold
  this.maxListenersWarningThreshold = maxListenersWarningThreshold;

  // create a proxy Contract type for this instance, as a Contract's provider
  // is stored as a class member rather than an instance variable. If we do
  // not create this proxy type, changing the provider in one instance of
  // web3-eth would subsequently change the provider for _all_ contract
  // instances!
  const self = this;
  const Contract = function Contract() {
    BaseContract.apply(this, arguments);

    // when Eth.setProvider is called, call packageInit
    // on all contract instances instantiated via this Eth
    // instances. This will update the currentProvider for
    // the contract instances
    const _this = this;
    const { setProvider } = self;
    self.setProvider = function () {
      setProvider.apply(self, arguments);
      core.packageInit(_this, [self]);
    };
  };

  Contract.setProvider = function () {
    BaseContract.setProvider.apply(this, arguments);
  };

  // make our proxy Contract inherit from web3-eth-contract so that it has all
  // the right functionality and so that instanceof and friends work properly
  Contract.prototype = Object.create(BaseContract.prototype);
  Contract.prototype.constructor = Contract;

  // add contract
  this.Contract = Contract;
  this.Contract.defaultAccount = this.defaultAccount;
  this.Contract.defaultBlock = this.defaultBlock;
  this.Contract.transactionBlockTimeout = this.transactionBlockTimeout;
  this.Contract.transactionConfirmationBlocks = this.transactionConfirmationBlocks;
  this.Contract.transactionPollingTimeout = this.transactionPollingTimeout;
  this.Contract.transactionPollingInterval = this.transactionPollingInterval;
  this.Contract.blockHeaderTimeout = this.blockHeaderTimeout;
  this.Contract.handleRevert = this.handleRevert;
  this.Contract._requestManager = this._requestManager;
  this.Contract._ethAccounts = this.accounts;
  this.Contract.currentProvider = this._requestManager.provider;

  // add IBAN
  this.Iban = Iban;

  // add ABI
  this.abi = abi;

  // add ENS
  this.ens = new ENS(this);

  var methods = [
    new Method({
      name: 'getNodeInfo',
      call: 'web3_clientVersion',
    }),
    new Method({
      name: 'getProtocolVersion',
      call: 'eth_protocolVersion',
      params: 0,
    }),
    new Method({
      name: 'getCoinbase',
      call: 'eth_coinbase',
      params: 0,
    }),
    new Method({
      name: 'isMining',
      call: 'eth_mining',
      params: 0,
    }),
    new Method({
      name: 'getHashrate',
      call: 'eth_hashrate',
      params: 0,
      outputFormatter: utils.hexToNumber,
    }),
    new Method({
      name: 'isSyncing',
      call: 'eth_syncing',
      params: 0,
      outputFormatter: formatter.outputSyncingFormatter,
    }),
    new Method({
      name: 'getGasPrice',
      call: 'eth_gasPrice',
      params: 0,
      outputFormatter: formatter.outputBigNumberFormatter,
    }),
    new Method({
      name: 'getFeeHistory',
      call: 'eth_feeHistory',
      params: 3,
      inputFormatter: [utils.numberToHex, formatter.inputBlockNumberFormatter, null],
    }),
    new Method({
      name: 'getAccounts',
      call: 'eth_accounts',
      params: 0,
      outputFormatter: utils.toChecksumAddress,
    }),
    new Method({
      name: 'getBlockNumber',
      call: 'eth_blockNumber',
      params: 0,
      outputFormatter: utils.hexToNumber,
    }),
    new Method({
      name: 'getBalance',
      call: 'eth_getBalance',
      params: 2,
      inputFormatter: [formatter.inputAddressFormatter, formatter.inputDefaultBlockNumberFormatter],
      outputFormatter: formatter.outputBigNumberFormatter,
    }),
    new Method({
      name: 'getStorageAt',
      call: 'eth_getStorageAt',
      params: 3,
      inputFormatter: [formatter.inputAddressFormatter, utils.numberToHex, formatter.inputDefaultBlockNumberFormatter],
    }),
    new Method({
      name: 'getCode',
      call: 'eth_getCode',
      params: 2,
      inputFormatter: [formatter.inputAddressFormatter, formatter.inputDefaultBlockNumberFormatter],
    }),
    new Method({
      name: 'getBlock',
      call: blockCall,
      params: 2,
      inputFormatter: [formatter.inputBlockNumberFormatter, function (val) { return !!val; }],
      outputFormatter: formatter.outputBlockFormatter,
    }),
    new Method({
      name: 'getUncle',
      call: uncleCall,
      params: 2,
      inputFormatter: [formatter.inputBlockNumberFormatter, utils.numberToHex],
      outputFormatter: formatter.outputBlockFormatter,

    }),
    new Method({
      name: 'getBlockTransactionCount',
      call: getBlockTransactionCountCall,
      params: 1,
      inputFormatter: [formatter.inputBlockNumberFormatter],
      outputFormatter: utils.hexToNumber,
    }),
    new Method({
      name: 'getBlockUncleCount',
      call: uncleCountCall,
      params: 1,
      inputFormatter: [formatter.inputBlockNumberFormatter],
      outputFormatter: utils.hexToNumber,
    }),
    new Method({
      name: 'getTransaction',
      call: 'eth_getTransactionByHash',
      params: 1,
      inputFormatter: [null],
      outputFormatter: formatter.outputTransactionFormatter,
    }),
    new Method({
      name: 'getTransactionFromBlock',
      call: transactionFromBlockCall,
      params: 2,
      inputFormatter: [formatter.inputBlockNumberFormatter, utils.numberToHex],
      outputFormatter: formatter.outputTransactionFormatter,
    }),
    new Method({
      name: 'getTransactionReceipt',
      call: 'eth_getTransactionReceipt',
      params: 1,
      inputFormatter: [null],
      outputFormatter: formatter.outputTransactionReceiptFormatter,
    }),
    new Method({
      name: 'getTransactionCount',
      call: 'eth_getTransactionCount',
      params: 2,
      inputFormatter: [formatter.inputAddressFormatter, formatter.inputDefaultBlockNumberFormatter],
      outputFormatter: utils.hexToNumber,
    }),
    new Method({
      name: 'sendSignedTransaction',
      call: 'eth_sendRawTransaction',
      params: 1,
      inputFormatter: [null],
      abiCoder: abi,
    }),
    new Method({
      name: 'signTransaction',
      call: 'eth_signTransaction',
      params: 1,
      inputFormatter: [formatter.inputTransactionFormatter],
    }),
    new Method({
      name: 'sendTransaction',
      call: 'eth_sendTransaction',
      params: 1,
      inputFormatter: [formatter.inputTransactionFormatter],
      abiCoder: abi,
    }),
    new Method({
      name: 'sign',
      call: 'eth_sign',
      params: 2,
      inputFormatter: [formatter.inputSignFormatter, formatter.inputAddressFormatter],
      transformPayload(payload) {
        payload.params.reverse();
        return payload;
      },
    }),
    new Method({
      name: 'call',
      call: 'eth_call',
      params: 2,
      inputFormatter: [formatter.inputCallFormatter, formatter.inputDefaultBlockNumberFormatter],
      abiCoder: abi,
    }),
    new Method({
      name: 'estimateGas',
      call: 'eth_estimateGas',
      params: 1,
      inputFormatter: [formatter.inputCallFormatter],
      outputFormatter: utils.hexToNumber,
    }),
    new Method({
      name: 'submitWork',
      call: 'eth_submitWork',
      params: 3,
    }),
    new Method({
      name: 'getWork',
      call: 'eth_getWork',
      params: 0,
    }),
    new Method({
      name: 'getPastLogs',
      call: 'eth_getLogs',
      params: 1,
      inputFormatter: [formatter.inputLogFormatter],
      outputFormatter: formatter.outputLogFormatter,
    }),
    new Method({
      name: 'getChainId',
      call: 'eth_chainId',
      params: 0,
      outputFormatter: utils.hexToNumber,
    }),
    new Method({
      name: 'requestAccounts',
      call: 'eth_requestAccounts',
      params: 0,
      outputFormatter: utils.toChecksumAddress,
    }),
    new Method({
      name: 'getProof',
      call: 'eth_getProof',
      params: 3,
      inputFormatter: [formatter.inputAddressFormatter, formatter.inputStorageKeysFormatter, formatter.inputDefaultBlockNumberFormatter],
      outputFormatter: formatter.outputProofFormatter,
    }),
    new Method({
      name: 'getPendingTransactions',
      call: 'eth_pendingTransactions',
      params: 0,
      outputFormatter: formatter.outputTransactionFormatter,
    }),
    new Method({
      name: 'createAccessList',
      call: 'eth_createAccessList',
      params: 2,
      inputFormatter: [formatter.inputTransactionFormatter, formatter.inputDefaultBlockNumberFormatter],
    }),

    // subscriptions
    new Subscriptions({
      name: 'subscribe',
      type: 'eth',
      subscriptions: {
        newBlockHeaders: {
          // TODO rename on RPC side?
          subscriptionName: 'newHeads', // replace subscription with this name
          params: 0,
          outputFormatter: formatter.outputBlockFormatter,
        },
        pendingTransactions: {
          subscriptionName: 'newPendingTransactions', // replace subscription with this name
          params: 0,
        },
        logs: {
          params: 1,
          inputFormatter: [formatter.inputLogFormatter],
          outputFormatter: formatter.outputLogFormatter,
          // DUBLICATE, also in web3-eth-contract
          subscriptionHandler(output) {
            if (output.removed) {
              this.emit('changed', output);
            } else {
              this.emit('data', output);
            }

            if (typeof this.callback === 'function') {
              this.callback(null, output, this);
            }
          },
        },
        syncing: {
          params: 0,
          outputFormatter: formatter.outputSyncingFormatter,
          subscriptionHandler(output) {
            const _this = this;

            // fire TRUE at start
            if (this._isSyncing !== true) {
              this._isSyncing = true;
              this.emit('changed', _this._isSyncing);

              if (typeof this.callback === 'function') {
                this.callback(null, _this._isSyncing, this);
              }

              setTimeout(() => {
                _this.emit('data', output);

                if (typeof _this.callback === 'function') {
                  _this.callback(null, output, _this);
                }
              }, 0);

              // fire sync status
            } else {
              this.emit('data', output);
              if (typeof _this.callback === 'function') {
                this.callback(null, output, this);
              }

              // wait for some time before fireing the FALSE
              clearTimeout(this._isSyncingTimeout);
              this._isSyncingTimeout = setTimeout(() => {
                if (output.currentBlock > output.highestBlock - 200) {
                  _this._isSyncing = false;
                  _this.emit('changed', _this._isSyncing);

                  if (typeof _this.callback === 'function') {
                    _this.callback(null, _this._isSyncing, _this);
                  }
                }
              }, 500);
            }
          },
        },
      },
    }),
  ];

  methods.forEach((method) => {
    method.attachToObject(_this);
    method.setRequestManager(_this._requestManager, _this.accounts); // second param is the eth.accounts module (necessary for signing transactions locally)
    method.defaultBlock = _this.defaultBlock;
    method.defaultAccount = _this.defaultAccount;
    method.transactionBlockTimeout = _this.transactionBlockTimeout;
    method.transactionConfirmationBlocks = _this.transactionConfirmationBlocks;
    method.transactionPollingTimeout = _this.transactionPollingTimeout;
    method.transactionPollingInterval = _this.transactionPollingInterval;
    method.handleRevert = _this.handleRevert;
  });
};

// Adds the static givenProvider and providers property to the Eth module
core.addProviders(Eth);

export default Eth;
