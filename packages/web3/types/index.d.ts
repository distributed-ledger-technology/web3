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
 * @file index.d.ts
 * @author Josh Stevens <joshstevens19@hotmail.co.uk>, Samuel Furter <samuel@ethereum.org>
 * @date 2018
 */

import * as net from 'https://deno.land/x/web3/types/net.d.ts';
import { Bzz } from 'https://deno.land/x/web3@v0.9.2/packages/web3-bzz/types/index.d.ts';
import {
  BatchRequest, provider, Providers, Extension, 
} from 'https://deno.land/x/web3@v0.9.2/packages/web3-core/types/index.d.ts';
import { Eth } from 'https://deno.land/x/web3@v0.9.2/packages/web3-eth/types/index.d.ts';
import { Personal } from 'https://deno.land/x/web3@v0.9.2/packages/web3-eth-personal/types/index.d.ts';
import { Network } from 'https://deno.land/x/web3@v0.9.2/packages/web3-net/types/index.d.ts';
import { Shh } from 'https://deno.land/x/web3@v0.9.2/packages/web3-shh/types/index.d.ts';
import { Utils } from 'https://deno.land/x/web3@v0.9.2/packages/web3-utils/types/index.d.ts';

export default class Web3 {
  constructor();

  constructor(provider: provider);

  constructor(provider: provider, net: net.Socket);

    static modules: Modules;

    readonly givenProvider: any;

    static readonly givenProvider: any;

    defaultAccount: string | null;

    defaultBlock: string | number;

    readonly currentProvider: provider;

    setProvider(provider: provider): boolean;

    BatchRequest: new () => BatchRequest;

    static readonly providers: Providers;

    utils: Utils;

    eth: Eth;

    shh: Shh;

    bzz: Bzz;

    version: string;

    static readonly version: string;

    static readonly utils: Utils;

    extend(extension: Extension): any;
}

export interface Modules {
    Eth: new (provider: provider, net: net.Socket) => Eth;
    Net: new (provider: provider, net: net.Socket) => Network;
    Personal: new (provider: provider, net: net.Socket) => Personal;
    Shh: new (provider: provider, net: net.Socket) => Shh;
    Bzz: new (provider: provider) => Bzz;
}
