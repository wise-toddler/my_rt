import WebSocket from 'ws'
import {createWorker} from './worker'
import { Router } from 'mediasoup/node/lib/Router';
let mediasoupRouter: Router;
const WebsocketConnection = async (websock: WebSocket.Server) =>
{
    try {
        mediasoupRouter = await createWorker();

    } catch (error) {
        throw error;
    }
    websock.on('connection', (ws: WebSocket) => 
    {
        ws.on('message', (message: string) => 
        {
            const jsonValidation = IsJsonString(message);
            if (!jsonValidation) 
            {
                console.error('Invalid JSON');
                return;
            }     
            const event = JSON.parse(message);

            switch (event.type)
            {
                case 'getRouterRtpCapabilities':
                    onRouterRtpCapabilities(event, ws);
                    break;

            }
               
        });
    })


    const onRouterRtpCapabilities = (event: String, ws: WebSocket) =>
    {
        send(ws, 'routerCapabilities', mediasoupRouter.rtpCapabilities);
    }

    const IsJsonString = (str: string) =>
    {
        try {
            JSON.parse(str);
        } catch (e) {
            return false;
        }
        return true;
    }

    const send = (ws: WebSocket, type: string, msg: any) =>
    {
        const message = 
        {
            type,
            data: msg
        }
        const resp = JSON.stringify(message);
        ws.send(resp);
    }

}

export {WebsocketConnection} 