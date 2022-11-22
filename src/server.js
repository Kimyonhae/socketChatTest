import express from "express";
import http from 'http';
import path from "path";
import {instrument} from "@socket.io/admin-ui";
import {Server} from "socket.io";
const app = express();
const _dirname = path.resolve();

app.set("view engine", "pug");

app.set("views",_dirname + "/src/views");

app.use("/public",express.static(_dirname + "/src/public"));

app.get("/",(req,res) => {
    res.render("home");
});

app.get("/*",(req,res) => {
    res.redirect("/");
});
const handleServer = () => console.log("Clear Url on http://localhost:3000");

const httpserver =  http.createServer(app);
const io = new Server(httpserver,{
    cors: {
        origin: ["https://admin.socket.io"],
        credentials: true
    }
});
instrument(io,{
    auth : false,
})

function publicRooms(){
    const {sockets : {adapter : {sids,rooms}}} = io;
    const publicRooms = [];
    rooms.forEach((_,key) => {
        if(sids.get(key) === undefined){
            publicRooms.push(key);
        }
    });
    return publicRooms;
}
function countRoom(roomName){
    return io.sockets.adapter.rooms.set().get(roomName)?.size;
}
io.on("connection",(socket) => {
    console.log("connection from Brower!!✅");
    io.sockets.emit("room_change",publicRooms());
    socket["nickName"] = "익명의 사용자";
    socket.on("enter_room",(roomName,done)=> 
    {
        socket.join(roomName);
        done();
        socket.to(roomName).emit("welcome",socket.nickName,countRoom(roomName));// 방에 있는 모두애개 "welcomeId 전달"
        io.sockets.emit("room_change",publicRooms());
    });
    socket.on("disconnecting",() => {
        socket.rooms.forEach((room) => 
        {
            socket.to(room).emit("bye",socket.nickName,countRoom(room)-1);
        });
    });
    socket.on("disconnect",() => {
        io.sockets.emit("room_change",publicRooms());
    });
    socket.on("new-Message",(msg,room,done) => {
        socket.to(room).emit("new-Message",`${socket.nickName} : ${msg}`);
        done(socket.nickName);
    });
    socket.on("nickName",(nickname) => {
        socket["nickName"] = nickname;
        socket.emit("change-nickName",socket.nickName);
    });
});
// const sockets = [];

// wss.on("connection",(socket) => {
//     sockets.push(socket);
//     socket["nicName"] = "익명의 사용자";
//     console.log("Connection to Brower!!✅");
//     socket.on("close",() => console.log("close from to brower"));
//     socket.on("message",(message) => {
//         const parsed = JSON.parse(message.toString());
//         if(parsed.type === "new_message"){
//             sockets.map(aSocket => {
//                 aSocket.send(`${socket.nicName} : ${parsed.payload}`);
//             });
//         }
//         else if(parsed.type === "nicName"){
//             socket["nicName"] = parsed.payload;
//         }
//     });
// });

httpserver.listen(3000,handleServer);
