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
 * @file utils.js
 * @author Marek Kotewicz <marek@parity.io>
 * @author Fabian Vogelsteller <fabian@ethereum.org>
 * @date 2017
 */

import ethjsUnit from 'https://jspm.dev/ethjs-unit';

import randombytes from 'https://jspm.dev/randombytes';
import BN from 'https://jspm.dev/bn.js';
import utils from './utils.js';
import soliditySha3 from './soliditySha3.js';

/**
 * Fires an error in an event emitter and callback and returns the eventemitter
 *
 * @method _fireError
 * @param {Object} error a string, a error, or an object with {message, data}
 * @param {Object} emitter
 * @param {Function} reject
 * @param {Function} callback
 * @param {any} optionalData
 * @return {Object} the emitter
 */
const _fireError = function (error, emitter, reject, callback, optionalData) {
  /* jshint maxcomplexity: 10 */

  // add data if given
  if (!!error && typeof error === 'object' && !(error instanceof Error) && error.data) {
    if (!!error.data && typeof error.data === 'object' || Array.isArray(error.data)) {
      error.data = JSON.stringify(error.data, null, 2);
    }

    error = `${error.message}\n${error.data}`;
  }

  if (typeof error === 'string') {
    error = new Error(error);
  }

  if (typeof callback === 'function') {
    callback(error, optionalData);
  }
  if (typeof reject === 'function') {
    // suppress uncatched error if an error listener is present
    // OR suppress uncatched error if an callback listener is present
    if (
      emitter
            && (typeof emitter.listeners === 'function'
            && emitter.listeners('error').length) || typeof callback === 'function'
    ) {
      emitter.catch(() => {});
    }
    // reject later, to be able to return emitter
    setTimeout(() => {
      reject(error);
    }, 1);
  }

  if (emitter && typeof emitter.emit === 'function') {
    // emit later, to be able to return emitter
    setTimeout(() => {
      emitter.emit('error', error, optionalData);
      emitter.removeAllListeners();
    }, 1);
  }

  return emitter;
};

/**
 * Should be used to create full function/event name from json abi
 *
 * @method _jsonInterfaceMethodToString
 * @param {Object} json
 * @return {String} full function/event name
 */
const _jsonInterfaceMethodToString = function (json) {
  if (!!json && typeof json === 'object' && json.name && json.name.indexOf('(') !== -1) {
    return json.name;
  }

  return `${json.name}(${_flattenTypes(false, json.inputs).join(',')})`;
};

/**
 * Should be used to flatten json abi inputs/outputs into an array of type-representing-strings
 *
 * @method _flattenTypes
 * @param {bool} includeTuple
 * @param {Object} puts
 * @return {Array} parameters as strings
 */
var _flattenTypes = function (includeTuple, puts) {
  // console.log("entered _flattenTypes. inputs/outputs: " + puts)
  const types = [];

  puts.forEach((param) => {
    if (typeof param.components === 'object') {
      if (param.type.substring(0, 5) !== 'tuple') {
        throw new Error('components found but type is not tuple; report on GitHub');
      }
      let suffix = '';
      const arrayBracket = param.type.indexOf('[');
      if (arrayBracket >= 0) { suffix = param.type.substring(arrayBracket); }
      const result = _flattenTypes(includeTuple, param.components);
      // console.log("result should have things: " + result)
      if (Array.isArray(result) && includeTuple) {
        // console.log("include tuple word, and its an array. joining...: " + result.types)
        types.push(`tuple(${result.join(',')})${suffix}`);
      } else if (!includeTuple) {
        // console.log("don't include tuple, but its an array. joining...: " + result)
        types.push(`(${result.join(',')})${suffix}`);
      } else {
        // console.log("its a single type within a tuple: " + result.types)
        types.push(`(${result})`);
      }
    } else {
      // console.log("its a type and not directly in a tuple: " + param.type)
      types.push(param.type);
    }
  });

  return types;
};

/**
 * Returns a random hex string by the given bytes size
 *
 * @param {Number} size
 * @returns {string}
 */
const randomHex = function (size) {
  return `0x${randombytes(size).toString('hex')}`;
};

/**
 * Should be called to get ascii from it's hex representation
 *
 * @method hexToAscii
 * @param {String} hex
 * @returns {String} ascii string representation of hex value
 */
const hexToAscii = function (hex) {
  if (!utils.isHexStrict(hex)) throw new Error('The parameter must be a valid HEX string.');

  let str = '';
  let i = 0; const 
    l = hex.length;
  if (hex.substring(0, 2) === '0x') {
    i = 2;
  }
  for (; i < l; i += 2) {
    const code = parseInt(hex.substr(i, 2), 16);
    str += String.fromCharCode(code);
  }

  return str;
};

/**
 * Should be called to get hex representation (prefixed by 0x) of ascii string
 *
 * @method asciiToHex
 * @param {String} str
 * @returns {String} hex representation of input string
 */
const asciiToHex = function (str) {
  if (!str) return '0x00';
  let hex = '';
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    const n = code.toString(16);
    hex += n.length < 2 ? `0${n}` : n;
  }

  return `0x${hex}`;
};

/**
 * Returns value of unit in Wei
 *
 * @method getUnitValue
 * @param {String} unit the unit to convert to, default ether
 * @returns {BN} value of the unit (in Wei)
 * @throws error if the unit is not correct:w
 */
const getUnitValue = function (unit) {
  unit = unit ? unit.toLowerCase() : 'ether';
  if (!ethjsUnit.unitMap[unit]) {
    throw new Error(`This unit "${unit}" doesn't exist, please use the one of the following units${JSON.stringify(ethjsUnit.unitMap, null, 2)}`);
  }
  return unit;
};

/**
 * Takes a number of wei and converts it to any other ether unit.
 *
 * Possible units are:
 *   SI Short   SI Full        Effigy       Other
 * - kwei       femtoether     babbage
 * - mwei       picoether      lovelace
 * - gwei       nanoether      shannon      nano
 * - --         microether     szabo        micro
 * - --         milliether     finney       milli
 * - ether      --             --
 * - kether                    --           grand
 * - mether
 * - gether
 * - tether
 *
 * @method fromWei
 * @param {Number|String} number can be a number, number string or a HEX of a decimal
 * @param {String} unit the unit to convert to, default ether
 * @return {String|Object} When given a BN object it returns one as well, otherwise a number
 */
const fromWei = function (number, unit) {
  unit = getUnitValue(unit);

  if (!utils.isBN(number) && !(typeof number === 'string')) {
    throw new Error('Please pass numbers as strings or BN objects to avoid precision errors.');
  }

  return utils.isBN(number) ? ethjsUnit.fromWei(number, unit) : ethjsUnit.fromWei(number, unit).toString(10);
};

/**
 * Takes a number of a unit and converts it to wei.
 *
 * Possible units are:
 *   SI Short   SI Full        Effigy       Other
 * - kwei       femtoether     babbage
 * - mwei       picoether      lovelace
 * - gwei       nanoether      shannon      nano
 * - --         microether     szabo        micro
 * - --         microether     szabo        micro
 * - --         milliether     finney       milli
 * - ether      --             --
 * - kether                    --           grand
 * - mether
 * - gether
 * - tether
 *
 * @method toWei
 * @param {Number|String|BN} number can be a number, number string or a HEX of a decimal
 * @param {String} unit the unit to convert from, default ether
 * @return {String|Object} When given a BN object it returns one as well, otherwise a number
 */
const toWei = function (number, unit) {
  unit = getUnitValue(unit);

  if (!utils.isBN(number) && !(typeof number === 'string')) {
    throw new Error('Please pass numbers as strings or BN objects to avoid precision errors.');
  }

  return utils.isBN(number) ? ethjsUnit.toWei(number, unit) : ethjsUnit.toWei(number, unit).toString(10);
};

/**
 * Converts to a checksum address
 *
 * @method toChecksumAddress
 * @param {String} address the given HEX address
 * @return {String}
 */
const toChecksumAddress = function (address) {
  if (typeof address === 'undefined') return '';

  if (!/^(0x)?[0-9a-f]{40}$/i.test(address)) throw new Error(`Given address "${address}" is not a valid Ethereum address.`);

  address = address.toLowerCase().replace(/^0x/i, '');
  const addressHash = utils.sha3(address).replace(/^0x/i, '');
  let checksumAddress = '0x';

  for (let i = 0; i < address.length; i++) {
    // If ith character is 8 to f then make it uppercase
    if (parseInt(addressHash[i], 16) > 7) {
      checksumAddress += address[i].toUpperCase();
    } else {
      checksumAddress += address[i];
    }
  }
  return checksumAddress;
};

/**
 * Returns -1 if a<b, 1 if a>b; 0 if a == b.
 * For more details on this type of function, see
 * developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort
 *
 * @method compareBlockNumbers
 *
 * @param {String|Number|BN} a
 *
 * @param {String|Number|BN} b
 *
 * @returns {Number} -1, 0, or 1
 */
const compareBlockNumbers = function(a, b) {
    if (a == b) {
        return 0;
    } if (("genesis" == a || "earliest" == a || 0 == a) && ("genesis" == b || "earliest" ==  b || 0 == b)) {
        return 0;
    } if ("genesis" == a || "earliest" == a) {
        // b !== a, thus a < b
        return -1;
    } if ("genesis" == b || "earliest" == b) {
        // b !== a, thus a > b
        return 1;
    } if (a == "latest") {
        if (b == "pending") {
            return -1;
        } 
            // b !== ("pending" OR "latest"), thus a > b
            return 1;
        
    } if (b === "latest") {
        if (a == "pending") {
            return 1;
        } 
            // b !== ("pending" OR "latest"), thus a > b
            return -1 
        
    } if (a == "pending") {
        // b (== OR <) "latest", thus a > b
        return 1;
    } if (b == "pending") {
        return -1;
    } else {
        let bnA = new BN(a);
        let bnB = new BN(b);
        if(bnA.lt(bnB)) {
            return -1;
        } else if(bnA.eq(bnB)) {
            return 0;
        } else {
            return 1;
        }
    }
};

export default {
  _fireError,
  _jsonInterfaceMethodToString,
  _flattenTypes,
  // extractDisplayName: extractDisplayName,
  // extractTypeName: extractTypeName,
  randomHex,
  BN: utils.BN,
  isBN: utils.isBN,
  isBigNumber: utils.isBigNumber,
  isHex: utils.isHex,
  isHexStrict: utils.isHexStrict,
  sha3: utils.sha3,
  sha3Raw: utils.sha3Raw,
  keccak256: utils.sha3,
  soliditySha3: soliditySha3.soliditySha3,
  soliditySha3Raw: soliditySha3.soliditySha3Raw,
  encodePacked: soliditySha3.encodePacked,
  isAddress: utils.isAddress,
  checkAddressChecksum: utils.checkAddressChecksum,
  toChecksumAddress,
  toHex: utils.toHex,
  toBN: utils.toBN,

  bytesToHex: utils.bytesToHex,
  hexToBytes: utils.hexToBytes,

  hexToNumberString: utils.hexToNumberString,

  hexToNumber: utils.hexToNumber,
  toDecimal: utils.hexToNumber, // alias

  numberToHex: utils.numberToHex,
  fromDecimal: utils.numberToHex, // alias

  hexToUtf8: utils.hexToUtf8,
  hexToString: utils.hexToUtf8,
  toUtf8: utils.hexToUtf8,
  stripHexPrefix: utils.stripHexPrefix,

  utf8ToHex: utils.utf8ToHex,
  stringToHex: utils.utf8ToHex,
  fromUtf8: utils.utf8ToHex,

  hexToAscii,
  toAscii: hexToAscii,
  asciiToHex,
  fromAscii: asciiToHex,

  unitMap: ethjsUnit.unitMap,
  toWei,
  fromWei,

  padLeft: utils.leftPad,
  leftPad: utils.leftPad,
  padRight: utils.rightPad,
  rightPad: utils.rightPad,
  toTwosComplement: utils.toTwosComplement,

  isBloom: utils.isBloom,
  isUserEthereumAddressInBloom: utils.isUserEthereumAddressInBloom,
  isContractAddressInBloom: utils.isContractAddressInBloom,
  isTopic: utils.isTopic,
  isTopicInBloom: utils.isTopicInBloom,
  isInBloom: utils.isInBloom,

  compareBlockNumbers,

  toNumber: utils.toNumber,
};
