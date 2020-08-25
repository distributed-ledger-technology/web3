import { fail, assertEquals } from "https://deno.land/std/testing/asserts.ts";
import { Web3Eth } from "./web3-eth.ts";


Deno.test("get balance", async (): Promise<void> => {

    try {
        const exampleAddress = '0x....'
        Web3Eth.getBalance(exampleAddress)
        fail('An error was expected as implementation has not begun yet.')
    } catch(error){
        assertEquals('Method needs to be implemented', error.message)
    }

});
