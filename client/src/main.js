const mediasoup = require('mediasoup-client')
const { v4: uuidv4 } = require('uuid')

let bntSub
let bntCam
let bntScreen
let textPublish
let textWebcam
let textScreen
let textSubscribe
let localVideo
let remoteVideo
let remoteStream
let device
let producer
let consumerTransport
let userId
let isWebcam
let producerCallback, producerErrback
let consumerCallback, ConsumerErrback
const websocketURL = 'ws://localhost:8001/ws'
let socket;

document.addEventListener('DOMContentLoaded', function () {
    // console.log('DOM loaded')
    bntCam = document.getElementById('bnt_webcam')
    bntScreen = document.getElementById('bnt_screen')
    bntSub = document.getElementById('bnt_sub')
    textWebcam = document.getElementById('webcam_status')
    textScreen = document.getElementById('screen_status')
    textSubscribe = document.getElementById('subscribe_status')
    localVideo = document.getElementById('localVideo')
    remoteVideo = document.getElementById('remoteVideo')

    bntCam.addEventListener('click', publish)
    bntScreen.addEventListener('click', publish)
    bntSub.addEventListener('click', () => {
        console.log('Sub btn clicked')
    })  
})

const publish = (e) => {
    const type = e.target.id
    isWebcam = type === 'bnt_webcam'
    textPublish = isWebcam ? textWebcam : textScreen
    bntScreen.disabled = true 
    bntCam.disabled = true

    const message = {
        type: 'createProducerTransport',
        forceTcp: false,
        rtpCapabilities: device.rtpCapabilities   

    }
    console.log('Publishing...')
    const resp = JSON.stringify(message)
    socket.send(resp)
}
const connect = () => 
{    
    // console.log('Connecting to server1')
    socket = new WebSocket(websocketURL)
    // console.log('Connecting to server2')
    socket.onerror = (error) => console.error('Error connecting to server: ${error}')
    socket.onclose = () => console.log('Disconnected from server: ${event.code} ${event.reason')
    socket.onopen = () => {
        console.log('Connected to server')
        const msg =
        {
            type: 'getRouterRtpCapabilities'
        }
        const resp= JSON.stringify(msg)
        socket.send(resp)
    }
    socket.onmessage = (event) => {
        const jsonValidation = IsJsonString(message)
        if (!jsonValidation) {
            console.error('Invalid JSON')
            return
        }
        const resp = JSON.parse(event.data)
        switch (resp.type) 
        {
            case 'routerCapabilities':
                onRouterCapabilities(resp)
                break
            case 'producerTransportCreated':
                onProducerTransportCreated(resp)
                break


                ///
            default:
                break
        }        
    }
    const IsJsonString = (str) => {
        try {
            JSON.parse(str)
        } catch (e) {
            return false
        }
        return true
    }
    const onProducerTransportCreated = async (event) => {
        if (event.error) {
            console.error("Error creating producer transport", event.error)  
            return
        }
        const transport = device.createSendTransport(event.data) // connect loval peer to server
        transport.on('connect', async ({ dtlsParameters }, callback, errback) => {
            const message = {
                type: 'connectProducerTransport',
                dtlsParameters
            }
            const resp = JSON.stringify(message)
            socket.send(resp)
            socket.addEventListener('message', (event) => 
            {
                const jsonValidation = IsJsonString(event.data)
                if (!jsonValidation) {
                    console.error('Invalid JSON')
                    return
                }
                const resp = JSON.parse(event.data)
                if(resp.type === 'producerConnected') 
                {
                    console.log('Producer connected')
                    callback()
                }
            })
        })
        
        
        transport.on('produce', async ({ kind, rtpParameters }, callback, errback) => 
        {
            const message = {
                type: 'produce',
                transportId: transport.id,
                kind,
                rtpParameters
            }
            const resp = JSON.stringify(message)
            socket.send(resp)
            socket.addEventListener('message', (event) => 
            {
                const jsonValidation = IsJsonString(event.data)
                if (!jsonValidation) {
                    console.error('Invalid JSON')
                    return
                }
                const resp = JSON.parse(event.data)
                if(resp.type === 'produced') 
                {
                    console.log('Produced')
                    callback({ id: resp.data.id })
                }
            })
        })
        // change in state
        transport.on('connectionStateChange', (state) => {
            switch (state) {
                case 'connecting':
                    textPublish.innerHTML = 'Publishing...'
                    break
                case 'connected':
                    localVideo.srcObject = stream
                    textPublish.innerHTML = 'Published'
                    break
                case 'failed':
                    transport.close()
                    textPublish.innerHTML = 'Failed'
                    break
                default:
                    break
            }
        })
        let stream
        try {
            stream = await getUserMedia(transport,isWebcam)
            const track = stream.getVideoTracks()[0]
            const params = { track }
            producer = await transport.produce(params)
        } catch (error) {
            console.error('Error accessing media devices', error)
            textPublish.innerHTML = 'Failed'
            return
        }


    }
    const onRouterCapabilities = async (resp) => {
        loadDevice(resp.data)
        bntCam.disabled = false 
        bntScreen.disabled = false    
    }
    const loadDevice = async (routerRtpCapabilities) => {
        try {
            device = new mediasoup.Device()
        } catch (error) {
            if (error.name === 'UnsupportedError') {
                console.error('browser not supported')
            }            
        }
        await device.load({ routerRtpCapabilities })
    }
}
connect()
const getUserMedia = async (constraints) => {
    if(!device.canProduce('video')) {
        console.error('cannot produce video')
        return
    }
    let stream
    try {
        stream = webcam? await navigator.mediaDevices.getUserMedia({ video: true, audio: true }) :
        await navigator.mediaDevices.getDisplayMedia({ video: true})

    } catch (error) {
        console.error('Error accessing media devices', error)
        throw error
    }
    return stream
}