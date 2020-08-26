
// https://ethereum.stackexchange.com/questions/42929/send-payment-from-wallet-using-web3
// https://web3js.readthedocs.io/en/v1.2.7/web3-utils.html#tohex


const fs = require('fs-sync')
const path = require('path')
const express = require('express')
const axios = require('axios')
const Web3 = require('web3');
const Tx = require('ethereumjs-tx').Transaction;
const http = require('http')
const https = require('https')
const cors = require('cors')

const configFileId = path.join(path.resolve(''), './web3-server/.env.json')
const config = fs.readJSON(configFileId)

const web3 = new Web3(new Web3.providers.HttpProvider(`https://mainnet.infura.io/v3/${config.infuraProjectId}`));
// let web3 = new Web3(Web3.givenProvider)

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

function defineRoutes(app) {

    app.get('/sendSignedTransaction', async (req, res) => {
        // var privateKey = Buffer.from('e331b6d69882b4cb4ea581d88e0b604039a3de5967688d3dcffdd2270c0fd109', 'hex');
        var privateKey = Buffer.from(req.query.privateKey, 'hex');

        // var rawTx = {
        //     nonce: '0x00',
        //     gasPrice: '0x09184e72a000',
        //     gasLimit: '0x2710',
        //     to: '0x0000000000000000000000000000000000000000',
        //     value: '0x00',
        //     data: '0x7f7465737432000000000000000000000000000000000000000000000000000000600057'
        // }

        var nonce = await web3.eth.getTransactionCount(req.query.fromAddress);
        console.log(`\n\nnonce: ${nonce}`)
        
        const myGasPrice = web3.utils.toHex((await web3.eth.getGasPrice()))
        console.log(`\n\nmyGasPrice: ${myGasPrice}`)
        
        const myGasLimit = web3.utils.toHex(200000)
        console.log(`\n\nmyGasLimit: ${myGasLimit}`)

        const myAmount = web3.utils.toHex(req.query.amountToBeSent)
        console.log(`\n\nmyAmount: ${myAmount}`)
        
    // console.log(amountToBeSent)

    // const rawTransaction = {
    //     "from": fromAddress,
    //     "nonce": web3.utils.toHex(nonce),
        var rawTx = {
            nonce,
            gasPrice: myGasPrice,
            gasLimit: myGasLimit,
            fromAddress: req.query.fromAddress,
            to: req.query.toAddress,
            value: myAmount,
            // data: '0x7f7465737432000000000000000000000000000000000000000000000000000000600057'
        }

        // var tx = new Tx(rawTx, { 'chain': 'mainnet' });
        var tx = new Tx(rawTx);

        tx.sign(privateKey);

        var serializedTx = tx.serialize();

        console.log(serializedTx.toString('hex'));
        // 0xf889808609184e72a00082271094000000000000000000000000000000000000000080a47f74657374320000000000000000000000000000000000000000000000000000006000571ca08a8bbf888cfa37bbf0bb965423625641fc956967b81d12e23709cead01446075a01ce999b56a8a88504be365442ea61239198e23d1fce7d00fcfc5cd3b44b7215f

        web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'))
            .on('receipt', console.log);

    })

    app.get('/getBalance', async (req, res) => {
        const web3Result = await web3.eth.getBalance(req.query.address)
        res.send({ balance: web3Result })
    })

    app.get('/getTransaction', async (req, res) => {
        const web3Result = await web3.eth.getTransaction(req.query.transactionHash)
        res.send({ transaction: web3Result })
    })

}

function startListening(app) {
    if (config.httpsPort > 0) {
        const certificate = fs.read(config.pathToCert)
        const privateCertKey = fs.read(config.pathToCertKey)
        const credentials = { key: privateCertKey, cert: certificate }
        const httpsServer = https.createServer(credentials, app)
        httpsServer.listen(config.httpsPort)
        console.log(`listening on : https://danceplanner.org`)
    }

    if (config.httpPort > 0) {
        const httpServer = http.createServer(app)
        httpServer.listen(config.httpPort)
        console.log(`listening on : http://localhost:${config.httpPort}`)
    }
}


async function transfer(fromAddress, toAddress, amountToBeSent, privateKey, chainId = 4) {

    console.log(`preparing transaction with \n${fromAddress} \n${toAddress} \n${amountToBeSent} \n${privateKey} \n${chainId}`)

    const EthereumTx = require('ethereumjs-tx').Transaction
    const privateKeyBuffer = Buffer.from(privateKey, 'hex')

    var nonce = web3.eth.getTransactionCount(fromAddress);

    const myGasPrice = (await web3.eth.getGasPrice()) * 10

    console.log(amountToBeSent)

    const rawTransaction = {
        "from": fromAddress,
        "nonce": web3.utils.toHex(nonce),
        "gasPrice": web3.utils.toHex(myGasPrice),
        "gasLimit": web3.utils.toHex(33000),
        // "gasLimit": '0x2710',
        "to": toAddress,
        "value": amountToBeSent,
        // "chainId": chainId //remember to change this
    };

    const tx = new EthereumTx(rawTransaction)
    tx.sign(privateKeyBuffer)

    const serializedTx = tx.serialize()

    console.log(`this is getting serious :)`)

    web3.eth.sendTransaction('0x' + serializedTx.toString('hex'), function (err, hash) {
        if (!err) {
            console.log('Txn Sent and hash is ' + hash);
        }
        else {
            console.error(err);
        }
    });
}