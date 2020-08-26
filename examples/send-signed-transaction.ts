import * as log from "https://deno.land/std/log/mod.ts";

import { Helper } from "../helper.ts";
import { Web3 } from "../web3.ts";
import { fromAddress, toAddress, amountToBeSent, privateKey } from "./.env.ts";

let amountInWei = Helper.getWeiFromEth(amountToBeSent)
const response = (await Web3.sendSignedTransaction(fromAddress, toAddress, amountInWei, privateKey)) 

log.info(response)