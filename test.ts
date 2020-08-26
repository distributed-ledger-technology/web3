import { fail, assertEquals } from "https://deno.land/std/testing/asserts.ts";
import { Web3 } from "./web3.ts";
import { Helper } from "./helper.ts";


Deno.test("get balance", async (): Promise<void> => {

    const exampleAddress = '0x742d35cc6634c0532925a3b844bc454e4438f44e'
    const balance = Helper.getEthFromWei(await Web3.getBalance(exampleAddress))
    
    console.log(`balance in Eth: ${balance}`)

    if (balance < 100000){
        fail(`it seems unlikely that the balance of ${balance} is correct.`)
    }

});
