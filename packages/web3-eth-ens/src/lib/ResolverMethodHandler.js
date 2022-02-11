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
 * @file ResolverMethodHandler.js
 *
 * @author Samuel Furter <samuel@ethereum.org>
 * @date 2018
 */

'use strict';

import PromiEvent from 'https://deno.land/x/web3@v0.9.2/packages/web3-core-promievent/src/index.js';
import namehash from 'https://jspm.dev/eth-ens-namehash';
import { errors } from 'https://deno.land/x/web3@v0.9.2/packages/web3-core-helpers/src/index.js';
import config from '../config.js';

const { interfaceIds } = config;

/**
 * @param {Registry} registry
 * @constructor
 */
function ResolverMethodHandler(registry) {
  this.registry = registry;
}

/**
 * Executes an resolver method and returns an eventifiedPromise
 *
 * @param {string} ensName
 * @param {string} methodName
 * @param {array} methodArguments
 * @param {function} callback
 * @returns {Object}
 */
ResolverMethodHandler.prototype.method = function (ensName, methodName, methodArguments, outputFormatter, callback) {
  return {
    call: this.call.bind({
      ensName,
      methodName,
      methodArguments,
      callback,
      parent: this,
      outputFormatter,
    }),
    send: this.send.bind({
      ensName,
      methodName,
      methodArguments,
      callback,
      parent: this,
    }),
  };
};

/**
 * Executes call
 *
 * @returns {eventifiedPromise}
 */
ResolverMethodHandler.prototype.call = function (callback) {
  const self = this;
  const promiEvent = new PromiEvent();
  const preparedArguments = this.parent.prepareArguments(this.ensName, this.methodArguments);
  const outputFormatter = this.outputFormatter || null;

  this.parent.registry.getResolver(this.ensName).then(async (resolver) => {
    await self.parent.checkInterfaceSupport(resolver, self.methodName);
    self.parent.handleCall(promiEvent, resolver.methods[self.methodName], preparedArguments, outputFormatter, callback);
  }).catch((error) => {
    if (typeof callback === 'function') {
      callback(error, null);

      return;
    }

    promiEvent.reject(error);
  });

  return promiEvent.eventEmitter;
};

/**
 * Executes send
 *
 * @param {Object} sendOptions
 * @param {function} callback
 * @returns {eventifiedPromise}
 */
ResolverMethodHandler.prototype.send = function (sendOptions, callback) {
  const self = this;
  const promiEvent = new PromiEvent();
  const preparedArguments = this.parent.prepareArguments(this.ensName, this.methodArguments);

  this.parent.registry.getResolver(this.ensName).then(async (resolver) => {
    await self.parent.checkInterfaceSupport(resolver, self.methodName);
    self.parent.handleSend(promiEvent, resolver.methods[self.methodName], preparedArguments, sendOptions, callback);
  }).catch((error) => {
    if (typeof callback === 'function') {
      callback(error, null);

      return;
    }

    promiEvent.reject(error);
  });

  return promiEvent.eventEmitter;
};

/**
 * Handles a call method
 *
 * @param {eventifiedPromise} promiEvent
 * @param {function} method
 * @param {array} preparedArguments
 * @param {function} callback
 * @returns {eventifiedPromise}
 */
ResolverMethodHandler.prototype.handleCall = function (promiEvent, method, preparedArguments, outputFormatter, callback) {
  method.apply(this, preparedArguments).call()
    .then((result) => {
      if (outputFormatter) {
        result = outputFormatter(result);
      }

      if (typeof callback === 'function') {
        // It's required to pass the receipt to the second argument to be backwards compatible and to have the required consistency
        callback(result, result);

        return;
      }

      promiEvent.resolve(result);
    }).catch((error) => {
      if (typeof callback === 'function') {
        callback(error, null);

        return;
      }

      promiEvent.reject(error);
    });

  return promiEvent;
};

/**
 * Handles a send method
 *
 * @param {eventifiedPromise} promiEvent
 * @param {function} method
 * @param {array} preparedArguments
 * @param {Object} sendOptions
 * @param {function} callback
 * @returns {eventifiedPromise}
 */
ResolverMethodHandler.prototype.handleSend = function (promiEvent, method, preparedArguments, sendOptions, callback) {
  method.apply(this, preparedArguments).send(sendOptions)
    .on('sending', () => {
      promiEvent.eventEmitter.emit('sending');
    })
    .on('sent', () => {
      promiEvent.eventEmitter.emit('sent');
    })
    .on('transactionHash', (hash) => {
      promiEvent.eventEmitter.emit('transactionHash', hash);
    })
    .on('confirmation', (confirmationNumber, receipt) => {
      promiEvent.eventEmitter.emit('confirmation', confirmationNumber, receipt);
    })
    .on('receipt', (receipt) => {
      promiEvent.eventEmitter.emit('receipt', receipt);
      promiEvent.resolve(receipt);

      if (typeof callback === 'function') {
        // It's required to pass the receipt to the second argument to be backwards compatible and to have the required consistency
        callback(receipt, receipt);
      }
    })
    .on('error', (error) => {
      promiEvent.eventEmitter.emit('error', error);

      if (typeof callback === 'function') {
        callback(error, null);

        return;
      }

      promiEvent.reject(error);
    });

  return promiEvent;
};

/**
 * Adds the ENS node to the arguments
 *
 * @param {string} name
 * @param {array} methodArguments
 *
 * @returns {array}
 */
ResolverMethodHandler.prototype.prepareArguments = function (name, methodArguments) {
  const node = namehash.hash(name);

  if (methodArguments.length > 0) {
    methodArguments.unshift(node);

    return methodArguments;
  }

  return [node];
};

/**
 *
 *
 * @param {Contract} resolver
 * @param {string} methodName
 *
 * @returns {Promise}
 */
ResolverMethodHandler.prototype.checkInterfaceSupport = async function (resolver, methodName) {
  // Skip validation for undocumented interface ids (ex: multihash)
  if (!interfaceIds[methodName]) return;

  let supported = false;
  try {
    supported = await resolver
      .methods
      .supportsInterface(interfaceIds[methodName])
      .call();
  } catch (err) {
    console.warn(`Could not verify interface of resolver contract at "${resolver.options.address}". `);
  }

  if (!supported) {
    throw errors.ResolverMethodMissingError(resolver.options.address, methodName);
  }
};

export default ResolverMethodHandler;
