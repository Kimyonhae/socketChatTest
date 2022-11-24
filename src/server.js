import express from "express";
import http from 'http';
import {Server} from "socket.io";
import path from "path";
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
    socket.on("join_room",(roomName) => {
        socket.join(roomName);
        socket.to(roomName).emit("welcome");
    });
    socket.on("offer",(offer,roomName) => {
        socket.to(roomName).emit("offer",offer);
    });
    socket.on("answer",(answer,roomName) => {
        socket.to(roomName).emit("answer",answer);
    });
    socket.on("ice",(ice,roomName) => {
        socket.to(roomName).emit("ice",ice);
    })
})

httpserver.listen(3000,handleServer);
