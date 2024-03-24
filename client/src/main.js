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
const websocketURL = 'wss://localhost:8000/ws'
let socket;

document.addEventListener('DOMContentLoaded', function () {
    bntCam = document.getElementById('bnt_webcam')
    bntScreen = document.getElementById('bnt_screen')
    bntSub = document.getElementById('bnt_sub')
    textWebcam = document.getElementById('webcam_status')
    textScreen = document.getElementById('screen_status')
    textSubscribe = document.getElementById('subscribe_status')
    localVideo = document.getElementById('localVideo')
    remoteVideo = document.getElementById('remoteVideo')

    bntCam.addEventListener('click', () => {
        console.log('Cam btn clicked')
    })
    bntScreen.addEventListener('click', () => {
        console.log('Screen btn clicked')
    })
    bntSub.addEventListener('click', () => {
        console.log('Sub btn clicked')
    })  
})
const connect = () => 
{    
    socket = new WebSocket(websocketURL)
    socket.onopen = () => {
        // console.log('Connected to server')
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