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
 * @file extend.js
 * @author Fabian Vogelsteller <fabian@ethereum.org>
 * @date 2017
 */

'use strict';

import { formatters } from 'https://deno.land/x/web3@v0.9.2/packages/web3-core-helpers/src/index.js';
import Method from 'https://deno.land/x/web3@v0.9.2/packages/web3-core-method/src/index.js';
import utils from 'https://deno.land/x/web3@v0.9.2/packages/web3-utils/src/index.js';

const extend = function (pckg) {
  /* jshint maxcomplexity:5 */
  const ex = function (extension) {
    let extendedObject;
    if (extension.property) {
      if (!pckg[extension.property]) {
        pckg[extension.property] = {};
      }
      extendedObject = pckg[extension.property];
    } else {
      extendedObject = pckg;
    }

    if (extension.methods) {
      extension.methods.forEach((method) => {
        if (!(method instanceof Method)) {
          method = new Method(method);
        }

        method.attachToObject(extendedObject);
        method.setRequestManager(pckg._requestManager);
      });
    }

    return pckg;
  };

  ex.formatters = formatters;
  ex.utils = utils;
  ex.Method = Method;

  return ex;
};

export default extend;
