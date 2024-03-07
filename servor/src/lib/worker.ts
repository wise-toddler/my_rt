import * as mediasoup from 'mediasoup';
import { config } from '../config';
import { Worker , Router} from 'mediasoup/node/lib/types';

const workers: Array<
{
    worker: Worker,
    router: Router
}> = [];

let nextMediasoupWorkerIdx = 0;

const createWorker = async () => {
    const worker = await mediasoup.createWorker({
        logLevel: config.mediasoup.worker.logLevel,
        logTags: config.mediasoup.worker.logTags,
        rtcMinPort: config.mediasoup.worker.rtcMinPort,
        rtcMaxPort: config.mediasoup.worker.rtcMaxPort,
    });
    worker.on('died', () => {
        console.error('mediasoup worker died, exiting in 2 seconds... [pid:%d]', worker.pid);
        setTimeout(() => process.exit(1), 2000);
    })
};
 
export {createWorker}