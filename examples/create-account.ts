import * as log from "https://deno.land/std/log/mod.ts";

import { Web3 } from "../web3.ts";


const newAccount = await Web3.createAccount()
log.info(newAccount)