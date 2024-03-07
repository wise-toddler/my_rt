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
let socket

document.addEventListener('DOMContentLoaded', function () {
    bntCam = document.getElementById('bnt_webcam')
    bntScreen = document.getElementById('bnt_screen')
    bntSub = document.getElementById('bnt_sub')
    textWebcam = document.getElementById('webcam_status')
    textScreen = document.getElementById('screen_status')
    textSubscribe = document.getElementById('subscribe_status')
    localVideo = document.getElementById('localVideo')
    remoteVideo = document.getElementById('remoteVideo')
})
