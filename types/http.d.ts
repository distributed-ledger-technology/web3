export interface AgentOptions {
    /**
     * Keep sockets around in a pool to be used by other requests in the future. Default = false
     */
    keepAlive?: boolean | undefined;
    /**
     * When using HTTP KeepAlive, how often to send TCP KeepAlive packets over sockets being kept alive. Default = 1000.
     * Only relevant if keepAlive is set to true.
     */
    keepAliveMsecs?: number | undefined;
    /**
     * Maximum number of sockets to allow per host. Default for Node 0.10 is 5, default for Node 0.12 is Infinity
     */
    maxSockets?: number | undefined;
    /**
     * Maximum number of sockets allowed for all hosts in total. Each request will use a new socket until the maximum is reached. Default: Infinity.
     */
    maxTotalSockets?: number | undefined;
    /**
     * Maximum number of sockets to leave open in a free state. Only relevant if keepAlive is set to true. Default = 256.
     */
    maxFreeSockets?: number | undefined;
    /**
     * Socket timeout in milliseconds. This will set the timeout after the socket is connected.
     */
    timeout?: number | undefined;
    /**
     * Scheduling strategy to apply when picking the next free socket to use.
     * @default `lifo`
     */
    scheduling?: 'fifo' | 'lifo' | undefined;
}

export class Agent {
    /**
     * By default set to 256\. For agents with `keepAlive` enabled, this
     * sets the maximum number of sockets that will be left open in the free
     * state.
     * @since v0.11.7
     */
    maxFreeSockets: number;

    /**
     * By default set to `Infinity`. Determines how many concurrent sockets the agent
     * can have open per origin. Origin is the returned value of `agent.getName()`.
     * @since v0.3.6
     */
    maxSockets: number;

    /**
     * By default set to `Infinity`. Determines how many concurrent sockets the agent
     * can have open. Unlike `maxSockets`, this parameter applies across all origins.
     * @since v14.5.0, v12.19.0
     */
    maxTotalSockets: number;

    /**
     * An object which contains arrays of sockets currently awaiting use by
     * the agent when `keepAlive` is enabled. Do not modify.
     *
     * Sockets in the `freeSockets` list will be automatically destroyed and
     * removed from the array on `'timeout'`.
     * @since v0.11.4
     */
    readonly freeSockets: any;

    /**
     * An object which contains arrays of sockets currently in use by the
     * agent. Do not modify.
     * @since v0.3.6
     */
    readonly sockets: any;

    /**
     * An object which contains queues of requests that have not yet been assigned to
     * sockets. Do not modify.
     * @since v0.5.9
     */
    readonly requests: any;

    constructor(opts?: AgentOptions);

    /**
     * Destroy any sockets that are currently in use by the agent.
     *
     * It is usually not necessary to do this. However, if using an
     * agent with `keepAlive` enabled, then it is best to explicitly shut down
     * the agent when it is no longer needed. Otherwise,
     * sockets might stay open for quite a long time before the server
     * terminates them.
     * @since v0.11.4
     */
    destroy(): void;
}
