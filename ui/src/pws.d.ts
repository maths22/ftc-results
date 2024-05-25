declare module "pws" {
    type PwsOptions = {
        pingTimeout?: number,
        maxTimeout?: number,
        maxRetries?: number,
        nextReconnectDelay?: (retries: number) => number,
        onopen?: (this: WebSocket, ev: Event) => any,
        onclose?: (this: WebSocket, ev: CloseEvent) => any,
        opnmessage?: (this: WebSocket, ev: MessageEvent) => any,
        onerror?: (this: WebSocket, ev: Event) => any

    }
    function pws(url: string, protocols: string | string[], WebSocket: WebSocket, options?: PwsOptions): WebSocket
    function pws(url: string, protocols: string | string[], options?: PwsOptions): WebSocket
    function pws(url: string, WebSocket: WebSocket, options?: PwsOptions): WebSocket
    function pws(url: string, options?: PwsOptions): WebSocket
    export = pws
}