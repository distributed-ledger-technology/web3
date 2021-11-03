# Web3

Thanks to [ntrotner](https://github.com/ntrotner) and thanks to the hints we have received in the context of [this issue](https://github.com/ChainSafe/web3.js/issues/3700), Deno is ready for web3 with this module.   

## Usage Example

### Get Balance
```ts

import Web3 from '../packages/web3/src/index.js'
import { PROVIDER_URL } from './.env.ts'

const web3 = new Web3(new (Web3 as any).providers.HttpProvider(PROVIDER_URL))

const balance = await (web3 as any).eth.getBalance("0x7a915e362353d72570dcf90aa5baa1c5b341c7aa")

console.log(`the balance is ${balance} wei`)

```

### Create Balance
```ts

import Web3 from '../packages/web3/src/index.js'
import { PROVIDER_URL } from './.env.ts'

const web3 = new Web3(new (Web3 as any).providers.HttpProvider(PROVIDER_URL))

const newAccount = await (web3 as any).eth.accounts.create()

console.log(newAccount)

```



## Contributions
Feel free to contribute by raising Pull Requests. If you are a contributor at https://github.com/ethereum or https://github.com/chainsafe let us know if you want to move this repository to the corresponding organization.


## Support
Feel free to create issues and fund their solutions e.g. via [https://gitcoin.co/](https://gitcoin.co/).  

