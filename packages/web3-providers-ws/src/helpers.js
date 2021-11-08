const isNode = Object.prototype.toString.call(typeof process !== 'undefined' ? process : 0) === '[object process]';
const isRN = typeof navigator !== 'undefined' && navigator.product === 'ReactNative';

let _btoa = null;
let helpers = null;
if (isNode || isRN) {
  _btoa = function (str) {
    return Buffer.from(str).toString('base64');
  };
  const url = require('url');
  if (url.URL) {
    // Use the new Node 6+ API for parsing URLs that supports username/password
    const newURL = url.URL;
    helpers = function (url) {
      return new newURL(url);
    };
  } else {
    // Web3 supports Node.js 5, so fall back to the legacy URL API if necessary
    helpers = require('url').parse;
  }
} else {
  _btoa = btoa.bind(window);
  helpers = function (url) {
    return new URL(url);
  };
}

export default {
  parseURL: helpers,
  btoa: _btoa,
};
