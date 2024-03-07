// import WebSocket from 'ws';
// import { WebsocketConnection } from './ws';

// describe('WebSocket Server', () => {
//     let server: WebSocket.Server;
//     let client: WebSocket;

//     beforeAll((done) => {
//         server = new WebSocket.Server({ port: 8080 }, done);
//         WebsocketConnection(server);
//     });

//     afterAll((done) => {
//         server.close(done);
//     });

//     beforeEach((done) => {
//         client = new WebSocket('ws://localhost:8080');
//         client.on('open', done);
//         client.on('error', (err) => {
//             console.error('Client error:', err);
//         });
//     });

//     afterEach((done) => {
//         return client.close(1000, undefined);
//     });

//     it('should receive a message from the server', (done) => {
//         client.send('Hello from client');

//         client.on('message', (message) => {
//             expect(message.toString()).toBe('Hello from server');
//             done();
//         });
//     });
// });