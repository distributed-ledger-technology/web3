import * as log from "https://deno.land/std/log/mod.ts";
import { Request } from 'https://deno.land/x/request@1.1.0/request.ts'


export class Web3 {

    public static async getBalance(address: string): Promise<number> {
        const url = `http://localhost:3026/getBalance?address=${address}`
        const response = await Request.get(url)

        log.info(response)

        return response.balance
    }

    public static async getTransaction(transactionHash: string): Promise<any> {
        const url = `http://localhost:3026/getTransaction?transactionHash=${transactionHash}`
        const response = await Request.get(url)

        log.info(response)

        return response
    }

    public static async sendSignedTransaction(fromAddress: string, toAddress: string, amountToBeSent: number, privateKey: string): Promise<number> {
        const url = `http://localhost:3026/sendSignedTransaction?fromAddress=${fromAddress}&toAddress=${toAddress}&amountToBeSent=${amountToBeSent}&privateKey=${privateKey}`
        const response = await Request.get(url)

        log.info(response)

        return response
    }

    public static async createAccount(): Promise<number> {
        const url = `http://localhost:3026/createAccount`
        const response = await Request.get(url)

        log.info(response.newAccount)

        return response.newAccount
    }

}