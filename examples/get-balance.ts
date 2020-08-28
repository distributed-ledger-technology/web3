import * as log from "https://deno.land/std/log/mod.ts";
import { Web3,  Helper } from "https://deno.land/x/web3/mod.ts";
import { fromAddress } from "./.env.ts";

const balance = Helper.getEthFromWei(await Web3.getBalance(fromAddress))
log.info(balance)