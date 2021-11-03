
import Web3 from 'https://deno.land/x/web3/mod.ts'
import { PROVIDER_URL } from './.env.ts'

const web3 = new Web3(new (Web3 as any).providers.HttpProvider(PROVIDER_URL))

const newAccount = await (web3 as any).eth.accounts.create()

console.log(newAccount)