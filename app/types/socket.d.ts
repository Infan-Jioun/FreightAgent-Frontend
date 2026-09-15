/* eslint-disable @typescript-eslint/no-explicit-any */
declare module "socket.io-client" {
    export interface Socket {
        id: string;
        connected: boolean;
        disconnected: boolean;
        on(event: string, fn: (...args: any[]) => void): this;
        once(event: string, fn: (...args: any[]) => void): this;
        off(event?: string, fn?: (...args: any[]) => void): this;
        emit(event: string, ...args: any[]): this;
        connect(): this;
        disconnect(): this;
        close(): this;
    }

    export interface ManagerOptions {
        query?: Record<string, string | number | boolean>;
        transports?: string[];
        reconnection?: boolean;
        reconnectionAttempts?: number;
        reconnectionDelay?: number;
        autoConnect?: boolean;
        withCredentials?: boolean;
        [key: string]: any;
    }

    export function io(uri?: string, opts?: ManagerOptions): Socket;
    export default io;
}
