import * as log from "https://deno.land/std/log/mod.ts";

import { Web3 } from "../web3.ts";
import { testTransaction } from "./.env.ts";

const transaction = (await Web3.getTransaction(testTransaction)) 
log.info(transaction)