import { assertEquals } from "https://deno.land/std/testing/asserts.ts";
import { Web3 } from "./web3.ts";


Deno.test("get balance", async (): Promise<void> => {

    const exampleAddress = '0x742d35cc6634c0532925a3b844bc454e4438f44e'
    const balance = await Web3.getBalance(exampleAddress)
    
    console.log(`balance in Wei: ${balance}`)

    assertEquals(balance / 1000000000000000000, 3695019662278441500000001 / 1000000000000000000)

});
