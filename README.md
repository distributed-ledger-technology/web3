# Web3

Thanks to [ntrotner](https://github.com/ntrotner) and thanks to the hints we have received in the context of [this issue](https://github.com/ChainSafe/web3.js/issues/3700), Deno is [ready for web3](https://ethereum.stackexchange.com/questions/112900/what-is-the-best-way-to-connect-to-the-ethereum-blockchain-from-a-deno-applicati) with this module.   

## Usage Example 

### Get Balance

```sh 

deno run --allow-net https://deno.land/x/web3/usage-examples/get-balance.ts https://mainnet.infura.io/v3/<your-project-id>

```


```ts

import Web3 from 'https://deno.land/x/web3/mod.ts'

const providerURL = Deno.args[0]

const web3 = new Web3(new Web3.providers.HttpProvider(providerURL))

const balance = await web3.eth.getBalance("0x7a915e362353d72570dcf90aa5baa1c5b341c7aa")

console.log(`the balance is ${balance} wei`)

```

### Get Transaction

```sh 

deno run --allow-net https://deno.land/x/web3/usage-examples/get-transaction.ts https://mainnet.infura.io/v3/<your-project-id>

```

```ts

import Web3 from 'https://deno.land/x/web3/mod.ts'

const providerURL = Deno.args[0]

const web3 = new Web3(new Web3.providers.HttpProvider(providerURL))

const transactionHash = "0x0d558d490c89fc94ddfebd284e39da5c1bcff15d18c4e9fd2eb37a202d20c703"

const transaction = (await web3.eth.getTransaction(transactionHash))

console.log(transaction)

```


### Create Account

```sh 

deno run --allow-net https://deno.land/x/web3/usage-examples/create-account.ts https://mainnet.infura.io/v3/<your-project-id>

```

```ts

import Web3 from 'https://deno.land/x/web3/mod.ts'

const providerURL = Deno.args[0]

const web3 = new Web3(new Web3.providers.HttpProvider(providerURL))

const newAccount = await web3.eth.accounts.create()

console.log(newAccount)

```

## Contributions
Feel free to contribute by raising Pull Requests. If you are a contributor at https://github.com/ethereum or https://github.com/chainsafe let us know if you want to move this repository to the corresponding organization.


## Support
Feel free to create issues and fund their solutions e.g. via [https://gitcoin.co/](https://gitcoin.co/).  

