export class Helper {

    public static getWeiFromEth(eth: number): number {
        return eth * 1000000000000000000
    }

    public static getEthFromWei(wei: number): number {
        return wei / 1000000000000000000
    }
}