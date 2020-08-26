# Web3 


As there seems to be no TypeScript implementation of web3 yet, the solution at hand uses a workaround (a node server) to bridge the gap between web3.ts and web3.js   

It would be cool if we come up with a long term TypeScript only version. This repo shall then probably be moved to https://github.com/ethereum.  


## Usage Examples

```sh

git clone https://github.com/michael-spengler/web3.ts.git
cd web3.ts/web3-server
npm i
cd ..
deno test --allow-net test.ts

```

