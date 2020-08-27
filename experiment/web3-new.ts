// inspired by https://stackoverflow.com/questions/61821038/how-to-use-npm-module-in-deno
import { createRequire } from "https://deno.land/std/node/module.ts";

const require = createRequire(import.meta.url);
const esprima = require("esprima");

const program = 'const answer = 42';
console.log(esprima.tokenize(program))

// until here it works as expected -->
// deno run --allow-read --unstable --allow-env web3-new.ts


// const web3 = require("web3");
// await web3.eth.getBalance('0x0c20E28e38fB60dB58FeF931ff94aC459F34458f')