import * as log from "https://deno.land/std/log/mod.ts";
import { Web3 } from "../web3.ts";
import { fromAddress } from "./.env.ts";
import { Helper } from "../helper.ts";

const balance = Helper.getEthFromWei(await Web3.getBalance(fromAddress))
log.info(balance)