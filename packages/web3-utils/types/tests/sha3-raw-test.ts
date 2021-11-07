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
 * @file sha3Raw-tests.ts
 * @author Samuel Furter <samuel@ethereum.org>
 * @date 2019
 */

import BN = require('https://jspm.dev/bn.js');
import { sha3Raw } from 'https://deno.land/x/web3/packages/web3-utils/src/index.js';

// $ExpectType string
sha3Raw('234');
// $ExpectType string
sha3Raw(new BN(3));

// $ExpectError
sha3Raw(['string']);
// $ExpectError
sha3Raw(234);
// $ExpectError
sha3Raw([4]);
// $ExpectError
sha3Raw({});
// $ExpectError
sha3Raw(true);
// $ExpectError
sha3Raw(null);
// $ExpectError
sha3Raw(undefined);
