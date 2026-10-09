const express = require("express");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");

const GameRoom = require("./game/GameRoom");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, "../client")));

const rooms = new Map();

function generateRoomCode() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

    let code;

    do {
        code = "";

        for (let i = 0; i < 4; i++) {
            code += chars[Math.floor(Math.random() * chars.length)];
        }

    } while (rooms.has(code));

    return code;
}

io.on("connection", socket => {

    console.log(`Connected: ${socket.id}`);

    socket.on("createRoom", ({ nickname }) => {

        const code = generateRoomCode();

        const room = new GameRoom(code, io);

        rooms.set(code, room);

        const player = room.addPlayer(
            socket.id,
            nickname
        );

        socket.join(code);
        socket.roomCode = code;

        socket.emit("roomCreated", {
            roomCode: code,
            player
        });

        room.broadcastLobby();
    });

    socket.on("joinRoom", ({ roomCode, nickname }) => {

        const code = String(roomCode || "")
            .trim()
            .toUpperCase();

        const room = rooms.get(code);

        if (!room) {
            socket.emit("errorMessage", "Room not found.");
            return;
        }

        if (room.players.size >= 8) {
            socket.emit("errorMessage", "Room is full.");
            return;
        }

        if (room.state.status !== "waiting") {
            socket.emit("errorMessage", "Game already started.");
            return;
        }

        const player = room.addPlayer(
            socket.id,
            nickname
        );

        socket.join(code);
        socket.roomCode = code;

        socket.emit("roomJoined", {
            roomCode: code,
            player
        });

        room.broadcastLobby();
    });

    socket.on("startGame", () => {

        const room = rooms.get(socket.roomCode);

        if (!room) return;

        if (room.players.size < 2) {
            socket.emit(
                "errorMessage",
                "At least 2 players are required."
            );
            return;
        }

        room.startRound();
    });

    socket.on("direction", direction => {

        const room = rooms.get(socket.roomCode);

        if (!room) return;

        room.handleDirection(
            socket.id,
            direction
        );
    });

    socket.on("placeBarricade", data => {

        const room = rooms.get(socket.roomCode);

        if (!room) return;

        room.placeBarricade(
            socket.id,
            data
        );
    });

    socket.on("disconnect", () => {

        const code = socket.roomCode;

        if (!code) return;

        const room = rooms.get(code);

        if (!room) return;

        room.removePlayer(socket.id);

        if (room.players.size === 0) {
            rooms.delete(code);
        } else {
            room.broadcastLobby();
        }

    });

});

server.listen(PORT, () => {

    console.log(
        `Stickman Maze Runner running on port ${PORT}`
    );

});
