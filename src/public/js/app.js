const socket = new io();
const welcome = document.querySelector("#welcome");
const roomForm = welcome.querySelector("#roomName");
const room = document.querySelector("#room");
const h1 = document.querySelector("#title");
const nickname = welcome.querySelector("#nickName");
const currentName = room.querySelector("#name h3");
room.hidden = true;
let roomName;
let nick;

function addMessage(message){
    const ul = room.querySelector("ul");
    const li = document.createElement("li");
    li.innerText = message;
    ul.append(li);
}

function handleMessageSubmit(event){
    event.preventDefault();
    const input = room.querySelector("#msg input");
    const value = input.value;
    socket.emit("new-Message",
    value,
    roomName,
    (nickname) => {
        addMessage(`${nickname === "익명의 사용자" ? "나 자신" : nickname} : ${value}`);
    });
    input.value = "";
}
function handleNicNameSubmit(event){
    event.preventDefault();
    const input = room.querySelector("#name input");
    socket.emit(
        "nickName",
        input.value,
    );
    currentName.innerHTML = input.value;
    alert("nickname이 변경되었습니다.");
}

function showRoom(){
    welcome.hidden = true;
    room.hidden = false;
    h1.innerHTML = roomName;
    const msgForm = room.querySelector("#msg");
    const nameForm = room.querySelector("#name");
    msgForm.addEventListener("submit",handleMessageSubmit);
    nameForm.addEventListener("submit",handleNicNameSubmit);
}

function handleChangeNameSubmit(event){
    event.preventDefault();
    const input = nickname.querySelector("input");
    nick = input.value;
    socket.emit(
        "nickName",
        input.value,
    );
    alert("닉네임이 설정 되었습니다.");
}
function changeNamefuction(changeName){
    const h3Name = nickname.querySelector("h3");
    h3Name.innerText = changeName;
}

function handleSubmit(event){
    if(nick === undefined){
        return alert("nickName을 먼저 바꾸세요");
    }
    else{
        event.preventDefault();
        const input = roomForm.querySelector("input");
        socket.emit("enter_room",
        input.value,
        showRoom, // socket을 끝내는 함수는 마지막에 넣으며 함수 실행을 backend에서 할수있다.
        );
        currentName.innerHTML = nick;
        roomName = input.value;
        input.value = "";
    }
}
roomForm.addEventListener("submit",handleSubmit);
nickname.addEventListener("submit",handleChangeNameSubmit);

socket.on("welcome",(nickname) => {
    addMessage(`${nickname}님이 들어왔습니다.`);
});
socket.on("bye",(nickname) => {
    addMessage(`${nickname}님이 나갔습니다.`);
});
socket.on("new-Message",(msg) => {
    addMessage(msg);
})
socket.on("change-nickName",(nickname) => {
    changeNamefuction(nickname);
});