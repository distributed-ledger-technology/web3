
import Web3 from '../mod.ts'
import { PROVIDER_URL } from './.env.ts'

const web3 = new Web3(new (Web3 as any).providers.HttpProvider(PROVIDER_URL))

const balance = await (web3 as any).eth.getBalance("0x7a915e362353d72570dcf90aa5baa1c5b341c7aa")

console.log(`the balance is ${balance} wei`)

