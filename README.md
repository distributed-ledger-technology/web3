# Web3 


As there seems to be no TypeScript implementation of web3 yet, the solution at hand uses a workaround (a node server) to bridge the gap between web3.ts and web3.js   

It would be cool if we come up with a long term TypeScript only version. This repo shall then probably be moved to https://github.com/ethereum.  


## Usage Examples

```sh

git clone https://github.com/michael-spengler/web3.git
cp .env-sample.ts .env.ts # no need to change anything here - just as an option
cd web3/web3-server
cp .env-sample.json .env.json # add your ingredients 
npm i
cd ..
pm2 start web3-server/web3-server.js
deno test --allow-net test.ts

```

## Contributions
Feel free to contribute by raising Pull Requests. If you are a contributor at https://github.com/ethereum let me know I'd like to move the repo there as soon as the time is right.


## Support
Feel free to create issues and fund their solution e.g. via [https://gitcoin.co/](https://gitcoin.co/).
