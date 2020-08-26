import * as log from "https://deno.land/std/log/mod.ts";

import { Web3 } from "../web3.ts";
import { fromAddress } from "./.env.ts";

const balance = (await Web3.getBalance(fromAddress)) / 1000000000000000000
log.info(balance)