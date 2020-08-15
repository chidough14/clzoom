

const socket = io('/')
const videoGrid = document.getElementById('video-grid')
const myVideo = document.createElement('video')
myVideo.muted = true

var peer = new Peer(undefined, {
    path: '/peerjs',
    host: '/',
    port: '3030'
    //port: '443'   for heroku
}); 


let myVideoStream

navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    myVideoStream = stream
    addVideoStream(myVideo, stream)

    peer.on('call', call => {   //new user call us
        call.answer(stream)   // we answer it
        const video = document.createElement('video')
        //add to the video stream
        call.on('stream', userVideoStream => {
            addVideoStream(video, userVideoStream)
        })
    })

    socket.on('user-connected', (userId) => {
        connectToNewUser(userId, stream)
    })


    let text = $('input')

    $('html').keydown((e) => {  //when user presses enter
        if(e.which == 13 && text.val().length !== 0) {
            //console.log(text.val())
            socket.emit('message', text.val())   //emit message to back end
            text.val('')
        }
    })

    socket.on('createMessage', message => {  //listen and receive message from backend
        //console.log('coming from server', message)
        $('ul').append(`<li class="message"><b>user: </b>${message}</li>`)
        scrollToBottom()
    })
   
})


peer.on('open', (id) => {  //peer object automatically generates user ids
    socket.emit('join-room', ROOM_ID, id)
})

//new user connects
const connectToNewUser = (userId, stream) => {
    const call = peer.call(userId, stream)   // we call the new user
    const video = document.createElement('video')
    //send new user our own video stream
    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream)
    })
}

const addVideoStream = (video, stream) => {
    video.srcObject = stream
    video.addEventListener('loadedmetadata', () => {
        video.play()
    })

    videoGrid.append(video)
}

const scrollToBottom = () => {
    var d =$('.main__chat__window')
    d.scrollTop(d.prop('scrollHeight'))
}

//mute our video
const muteUnmute = () => {
   const enabled = myVideoStream.getAudioTracks()[0].enabled  //get current stream,get first audio track for the stream, get current enabled version of audio track
   if(enabled) {
        myVideoStream.getAudioTracks()[0].enabled = false  // disable audiotrack if it is enabled
        setUnmuteButton()
   } else {
    myVideoStream.getAudioTracks()[0].enabled = true  // enable audiotrack if it is disabled
    setMuteButton()
   }
}

const setMuteButton = () => {
    const html = `<i class="fa fa-microphone" aria-hidden="true"></i>
                    <span>Mute</span>`

    document.querySelector('.main__mute__button').innerHTML = html                
 }

 const setUnmuteButton = () => {
    const html = `<i class="unmute fa fa-microphone-slash" aria-hidden="true"></i>
        <span>Unmute</span>`

    document.querySelector('.main__mute__button').innerHTML = html  
 }

 const playStop = () => {
    let enabled = myVideoStream.getVideoTracks()[0].enabled  //get current stream,
    if(enabled) {
         myVideoStream.getVideoTracks()[0].enabled = false  // disable video if it is enabled
         setPlayVideo()
    } else {
     myVideoStream.getVideoTracks()[0].enabled = true  // enable video if it is disabled
     setStopVideo()
    }
 }

 const setStopVideo = () => {
    const html = `<i class="fa fa-video" aria-hidden="true"></i>
                    <span>Stop Video</span>`

    document.querySelector('.main__video__button').innerHTML = html                
 }

 const setPlayVideo = () => {
    const html = `<i class="stop fa fa-video-slash" aria-hidden="true"></i>
        <span>Play Video</span>`

    document.querySelector('.main__video__button').innerHTML = html  
 }



