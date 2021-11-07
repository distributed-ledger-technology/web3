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

import core from 'https://deno.land/x/web3/packages/web3-core/src/index.js';
import { subscriptions as Subscriptions } from 'https://deno.land/x/web3/packages/web3-core-subscriptions/src/index.js';
import Method from 'https://deno.land/x/web3/packages/web3-core-method/src/index.js';

// var formatters = require('https://deno.land/x/web3/packages/web3-core-helpers/src/index.js').formatters;
import Net from 'https://deno.land/x/web3/packages/web3-net/src/index.js';

const Shh = function Shh() {
  const _this = this;

  // sets _requestmanager
  core.packageInit(this, arguments);

  // overwrite package setRequestManager
  const { setRequestManager } = this;
  this.setRequestManager = function (manager) {
    setRequestManager(manager);

    _this.net.setRequestManager(manager);

    return true;
  };

  // overwrite setProvider
  const { setProvider } = this;
  this.setProvider = function () {
    setProvider.apply(_this, arguments);

    _this.setRequestManager(_this._requestManager);
  };

  this.net = new Net(this);

  [
    new Subscriptions({
      name: 'subscribe',
      type: 'shh',
      subscriptions: {
        messages: {
          params: 1,
          // inputFormatter: [formatters.inputPostFormatter],
          // outputFormatter: formatters.outputPostFormatter
        },
      },
    }),

    new Method({
      name: 'getVersion',
      call: 'shh_version',
      params: 0,
    }),
    new Method({
      name: 'getInfo',
      call: 'shh_info',
      params: 0,
    }),
    new Method({
      name: 'setMaxMessageSize',
      call: 'shh_setMaxMessageSize',
      params: 1,
    }),
    new Method({
      name: 'setMinPoW',
      call: 'shh_setMinPoW',
      params: 1,
    }),
    new Method({
      name: 'markTrustedPeer',
      call: 'shh_markTrustedPeer',
      params: 1,
    }),
    new Method({
      name: 'newKeyPair',
      call: 'shh_newKeyPair',
      params: 0,
    }),
    new Method({
      name: 'addPrivateKey',
      call: 'shh_addPrivateKey',
      params: 1,
    }),
    new Method({
      name: 'deleteKeyPair',
      call: 'shh_deleteKeyPair',
      params: 1,
    }),
    new Method({
      name: 'hasKeyPair',
      call: 'shh_hasKeyPair',
      params: 1,
    }),
    new Method({
      name: 'getPublicKey',
      call: 'shh_getPublicKey',
      params: 1,
    }),
    new Method({
      name: 'getPrivateKey',
      call: 'shh_getPrivateKey',
      params: 1,
    }),
    new Method({
      name: 'newSymKey',
      call: 'shh_newSymKey',
      params: 0,
    }),
    new Method({
      name: 'addSymKey',
      call: 'shh_addSymKey',
      params: 1,
    }),
    new Method({
      name: 'generateSymKeyFromPassword',
      call: 'shh_generateSymKeyFromPassword',
      params: 1,
    }),
    new Method({
      name: 'hasSymKey',
      call: 'shh_hasSymKey',
      params: 1,
    }),
    new Method({
      name: 'getSymKey',
      call: 'shh_getSymKey',
      params: 1,
    }),
    new Method({
      name: 'deleteSymKey',
      call: 'shh_deleteSymKey',
      params: 1,
    }),

    new Method({
      name: 'newMessageFilter',
      call: 'shh_newMessageFilter',
      params: 1,
    }),
    new Method({
      name: 'getFilterMessages',
      call: 'shh_getFilterMessages',
      params: 1,
    }),
    new Method({
      name: 'deleteMessageFilter',
      call: 'shh_deleteMessageFilter',
      params: 1,
    }),

    new Method({
      name: 'post',
      call: 'shh_post',
      params: 1,
      inputFormatter: [null],
    }),

    new Method({
      name: 'unsubscribe',
      call: 'shh_unsubscribe',
      params: 1,
    }),
  ].forEach((method) => {
    method.attachToObject(_this);
    method.setRequestManager(_this._requestManager);
  });
};

Shh.prototype.clearSubscriptions = function () {
  this._requestManager.clearSubscriptions();
};

core.addProviders(Shh);

export default Shh;
