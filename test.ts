import Web3 from 'https://deno.land/x/web3@v0.5.1/mod.ts'

const providerURL = Deno.args[0]

const web3 = new Web3(new (Web3 as any).providers.HttpProvider(providerURL))

const balance = await (web3 as any).eth.getBalance("0x7a915e362353d72570dcf90aa5baa1c5b341c7aa")

console.log(`the balance is ${balance} wei`)