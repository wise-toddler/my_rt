import WebSocket from 'ws'
import {createWorker} from './worker'
let mediasoupRouter;
const WebsocketConnection = async (websock: WebSocket.Server) =>
{
    try {
        mediasoupRouter = await createWorker();

    } catch (error) {
        throw error;
    }
    websock.on('connection', (ws: WebSocket) => {
        ws.on('message', (message: string) => {
            console.log("message: => ", message);
            ws.send('Hello from server');
            
        });
    })
}

export {WebsocketConnection} 