import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { Infrastructure } from "./base";
import { Server, ServerOptions } from "socket.io"
import { RawServerDefault } from "fastify";

export class WebsocketService extends Infrastructure {
    private connection: Record<string, Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>>
    private instance: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>

    getInstance(name?: string) {
        if (name) {
            if (!this.connection[name]) {
                throw new Error('INSTANCE_NOT_FOUND')
            }
        }
    }

    /** Create new instance / server */
    createInstance(server: RawServerDefault, opts: Partial<ServerOptions>) {
        return new Promise((reject, resolve) => {
            const connection = new Server(server, opts)

            connection.on('connection', (data) => {
                console.log("Connected")
                resolve(data)
            })


            connection.on('error', (err) => {
                reject(err)
            })
        })
    }

    /** Connect to existing */
    addInstance() {

    }

    send(message: string) {

    }

    async close() {
        if (this.instance) {
            return new Promise<void>((resolve, reject) => {
                this.instance.close((err) => {
                    if (err) reject(err)
                    else resolve()
                })
            })
        }
    }
}

export default new WebsocketService