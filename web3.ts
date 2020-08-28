import * as log from "https://deno.land/std/log/mod.ts";
import { Request } from 'https://deno.land/x/request@1.1.0/request.ts'
import { web3ServerBaseURL } from './.env.ts'

export class Web3 {

    public static async getBalance(address: string): Promise<number> {
        const url = `${web3ServerBaseURL}/getBalance?address=${address}`
        const response = await Request.get(url)

        log.info(response)

        return response.balance
    }

    public static async getTransaction(transactionHash: string): Promise<any> {
        const url = `${web3ServerBaseURL}/getTransaction?transactionHash=${transactionHash}`
        const response = await Request.get(url)

        log.info(response)

        return response
    }

    public static async sendSignedTransaction(fromAddress: string, toAddress: string, amountToBeSent: number, privateKey: string): Promise<number> {
        const url = `${web3ServerBaseURL}/sendSignedTransaction?fromAddress=${fromAddress}&toAddress=${toAddress}&amountToBeSent=${amountToBeSent}&privateKey=${privateKey}`
        const response = await Request.get(url)

        log.info(response)

        return response
    }

    public static async createAccount(): Promise<number> {
        const url = `${web3ServerBaseURL}/createAccount`
        const response = await Request.get(url)

        log.info(response.newAccount)

        return response.newAccount
    }

}