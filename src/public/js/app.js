const socket = io();
const myface = document.querySelector("#myFace");
const muteBtn = document.querySelector("#mute");
const cameraBtn = document.querySelector("#camera");
const selectCamera = document.getElementById("selectCamera");
const call = document.querySelector("#call");

call.hidden = true;

let myStream;
let muted = false;
let cameraOff = false;
let roomName;
let myPeerConnection;

async function getCamera(){
    try{
        const devices = await navigator.mediaDevices.enumerateDevices();
        const cameras = devices.filter((video) => video.kind === "videoinput");
        const currentCamera = myStream.getVideoTracks()[0];
        cameras.map((camera) => {
            const option = document.createElement("option");
            option.value = camera.deviceId;
            option.label = camera.label;
            if(currentCamera.label === camera.label){
                option.selected = true;
            };
            selectCamera.appendChild(option);
        });
    }catch(e){
        console.log(e)
    };
}

async function getMedia(deviceId){
    const initialConstrains = {
        audio : true,
        video : {facinaMode : "user"},
    };
    const cameraConstrains = {
        audio : true,
        video : {video : {exact : deviceId}},
    };
    try {
        myStream = await navigator.mediaDevices.getUserMedia(
            deviceId ? cameraConstrains : initialConstrains,
        );
        myface.srcObject = myStream;
        if(!deviceId){
            await getCamera();
        }
    }catch(e){
        console.log(e);
    }
};

function handleMuteClick(){
    myStream.getAudioTracks().map((track) => track.enabled = !track.enabled);
    if(!muted){
        muteBtn.innerText = "UnMute";
        muted = true;
    }else {
        muteBtn.innerText = "Mute";
        muted = false;
    }
};
function handleCameraClick(){
    myStream.getVideoTracks().map((video) => video.enabled = !video.enabled);
    if(!cameraOff){
        cameraBtn.innerText = "Turn Camera Off";
        cameraOff = true;
    }else {
        cameraBtn.innerText = "Turn Camera ON";
        cameraOff = false;
    }
};

async function handleCameraChange(){
    await getMedia(selectCamera.value);
}

muteBtn.addEventListener("click",handleMuteClick);
cameraBtn.addEventListener("click",handleCameraClick);
selectCamera.addEventListener("input",handleCameraChange);

//welcome div start js

const welcome = document.querySelector("#welcome");
const welcomeForm = welcome.querySelector("form");

async function initcall(){
    welcome.hidden = true;
    call.hidden = false;
    await getMedia();
    makeConnection();
}

async function handlewelcomeSubmit(event){
    event.preventDefault();
    const input = welcomeForm.querySelector("input");
    await initcall();
    socket.emit("join_room",input.value);
    roomName = input.value; 
    input.value = "";
}

welcomeForm.addEventListener("submit",handlewelcomeSubmit);

//socket code!!

socket.on("welcome",async() => {
    const offer = await myPeerConnection.createOffer();
    myPeerConnection.setLocalDescription(offer);//localDescription????????? = ??? ????????? ?????? ??????..?
    console.log("send a offer");
    socket.emit("offer",offer,roomName);
});
socket.on("offer",async(offer) => {
    console.log("receive offer");
    myPeerConnection.setRemoteDescription(offer);//setRemoteDescription????????? = offer??? ???????????? ?????? ??????..?
    const answer = await myPeerConnection.createAnswer();
    socket.emit("answer",answer,roomName);
    console.log("sent answer");
});
socket.on("answer",(answer) => {
    console.log("receive the answer");
    myPeerConnection.setRemoteDescription(answer);
});
socket.on("ice", (ice) => {
    console.log("received candidate");
    myPeerConnection.addIceCandidate(ice);
});
//WebRTC connect code
function makeConnection(){
    myPeerConnection = new RTCPeerConnection();
    myPeerConnection.addEventListener("icecandidate",handleIce);
    myPeerConnection.addEventListener("track",handleAddStream);
    myStream.getTracks().forEach((track) => myPeerConnection.addTrack(track,myStream));
}
function handleIce(data){
    console.log("sent candidate");
    socket.emit("ice",data.candidate,roomName);   
}
function handleAddStream(event){
    const peerFace = document.querySelector("#peerFace");
    event.streams.forEach((stream) => {
        peerFace.srcObject = stream; // I can't see the face of the other person 
    });

}