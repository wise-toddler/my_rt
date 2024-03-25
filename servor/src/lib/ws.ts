import WebSocket, { on } from 'ws'
import {createWorker} from './worker'
import { Router } from 'mediasoup/node/lib/Router';
import { createWebrtcTransport } from './CreateWebrtcTransport'
import { Transport } from 'mediasoup/node/lib/Transport';
import { Producer } from 'mediasoup/node/lib/Producer';
let mediasoupRouter: Router;
let producerTransport: Transport;
let producer: Producer
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
                case 'createProducerTransport':
                    onCreateProducerTransport(event, ws);
                    break;
                case 'connectProducerTransport':
                    onConnectProducerTransport(event, ws);
                    break;
                case 'produce':
                    onProduce(event, ws, websock);
                    break;
            }   
               
        });
    })


    const onConnectProducerTransport = async (event: any, ws: WebSocket) =>
    {
        await producerTransport.connect({ dtlsParameters: event.dtlsParameters });
        send(ws, 'producerConnected', "Producer connected successfully!");
    }

    const onRouterRtpCapabilities = (event: string, ws: WebSocket) =>
    {
        send(ws, 'routerCapabilities', mediasoupRouter.rtpCapabilities);
    }
    const onCreateProducerTransport = async (event: string, ws: WebSocket) =>
    {
        try 
        {
            const {transport, params} = await createWebrtcTransport(mediasoupRouter);
            producerTransport = transport;
            send(ws, 'producerTransportCreated', params);
        } catch (error) {
            console.error(error);
            send(ws, 'error', error);
        }
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
    
    const broadcast = (ws: WebSocket.Server, type: string, msg: any) =>
    {
        const message =
        {
            type,
            data: msg
        }
        const resp = JSON.stringify(message);
        ws.clients.forEach(client => 
        {
            if (client.readyState === WebSocket.OPEN) 
            {
                client.send(resp);
            }
        });
    }
    const onProduce = async (event: any, ws: WebSocket, websocket: WebSocket.Server) =>
    {
        const {kind, rtpParameters} = event;
        producer = await producerTransport.produce({ kind, rtpParameters });
        const resp = 
        {
            id: producer.id
        }
        send(ws, 'produced', resp);
        broadcast(websocket, 'newProducer', 'new user has joined the room');
    }

}

export {WebsocketConnection} 