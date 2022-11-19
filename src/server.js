import express from "express";
import http from 'http';
import path from "path";
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
const io = new Server(httpserver);

io.on("connection",(socket) => {
    console.log("connection from Brower!!✅");
    socket["nickName"] = "익명의 사용자";
    socket.on("enter_room",(roomName,done)=> 
    {
        socket.join(roomName);
        console.log(socket.rooms);
        done();
        socket.to(roomName).emit("welcome",socket.nickName);// 방에 있는 모두애개 "welcomeId 전달"
    });
    socket.on("disconnecting",() => {
        socket.rooms.forEach((room) => 
        {
            socket.to(room).emit("bye",socket.nickName);
        });
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
