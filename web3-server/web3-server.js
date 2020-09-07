

const fs = require('fs-sync')
const path = require('path')
const express = require('express')
const Web3 = require('web3');
const Tx = require('ethereumjs-tx').Transaction;
const http = require('http')
const https = require('https')
const cors = require('cors')

const configFileId = path.join(path.resolve(''), './web3-server/.env.json')
const config = fs.readJSON(configFileId)

const web3 = new Web3(new Web3.providers.HttpProvider(`https://mainnet.infura.io/v3/${config.infuraProjectId}`));
let allowed = true

executeMasterplan()
    .then((result) => {
        console.log('masterplan works')
    })
    .catch((error) => console.log(error.message))

async function executeMasterplan() {
    const app = express();
    app.use(cors())
    defineRoutes(app)
    startListening(app)
}

setInterval(() => {
    allowed = true
}, 60 * 1000)


function demoAuthMiddleware(req, res, next) {
    if (allowed) {
        allowed = false
        next()
    } else {
        res.send({ message: 'this is just for demo reasons' })
    }
}

function defineRoutes(app) {

    app.get('/sendSignedTransaction', demoAuthMiddleware, async (req, res) => {
        var privateKey = Buffer.from(req.query.privateKey, 'hex');

        var nonce = await web3.eth.getTransactionCount(req.query.fromAddress);
        console.log(`\n\nnonce: ${nonce}`)

        const myGasPrice = web3.utils.toHex((await web3.eth.getGasPrice()))
        console.log(`\n\nmyGasPrice: ${myGasPrice}`)

        const myGasLimit = web3.utils.toHex(200000)
        console.log(`\n\nmyGasLimit: ${myGasLimit}`)

        const myAmount = web3.utils.toHex(req.query.amountToBeSent)
        console.log(`\n\nmyAmount: ${myAmount}`)

        var rawTx = {
            nonce,
            gasPrice: myGasPrice,
            gasLimit: myGasLimit,
            fromAddress: req.query.fromAddress,
            to: req.query.toAddress,
            value: myAmount,
        }

        var tx = new Tx(rawTx);

        tx.sign(privateKey);

        var serializedTx = tx.serialize();

        web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'))
            .on('receipt', console.log);

    })

    app.get('/getBalance', demoAuthMiddleware, async (req, res) => {
        const web3Result = await web3.eth.getBalance(req.query.address)
        res.send({ balance: web3Result })
    })

    app.get('/getTransaction', demoAuthMiddleware, async (req, res) => {
        const web3Result = await web3.eth.getTransaction(req.query.transactionHash)
        res.send({ transaction: web3Result })
    })

    app.get('/createAccount', demoAuthMiddleware, async (req, res) => {
        const web3Result = await web3.eth.accounts.create()
        res.send({ newAccount: web3Result })
    })

}

function startListening(app) {
    if (config.httpsPort > 0) {
        const certificate = fs.read(config.pathToCert)
        const privateCertKey = fs.read(config.pathToCertKey)
        const credentials = { key: privateCertKey, cert: certificate }
        const httpsServer = https.createServer(credentials, app)
        httpsServer.listen(config.httpsPort)
        console.log(`listening on : https://fancy-chats.com:${config.httpsPort}`)
    }

    if (config.httpPort > 0) {
        const httpServer = http.createServer(app)
        httpServer.listen(config.httpPort)
        console.log(`listening on : http://localhost:${config.httpPort}`)
    }
}
