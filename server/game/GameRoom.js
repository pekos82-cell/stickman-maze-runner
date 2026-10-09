const Player = require("./Player");
const GameState = require("./GameState");

class GameRoom {

    constructor(code, io) {

        this.code = code;
        this.io = io;

        this.players = new Map();

        this.state = new GameState();

        this.tickInterval = null;
        this.lastTick = Date.now();
    }

    addPlayer(id, nickname) {

        const player =
            new Player(
                id,
                nickname,
                this.players.size
            );

        this.players.set(id, player);

        return player.serialize();
    }

    removePlayer(id) {

        this.players.delete(id);

        delete this.state.players[id];

        if (this.players.size === 0) {

            this.stopGame();
        }
    }

    broadcastLobby() {

        this.io
            .to(this.code)
            .emit("lobbyUpdate", {
                roomCode: this.code,

                players:
                    Array.from(this.players.values())
                        .map(player => ({
                            id: player.id,
                            nickname: player.nickname,
                            color: player.color
                        }))
            });
    }

    startRound() {

        this.state.round++;

        this.state.status = "running";

        this.state.createMaze();

        this.state.barricades = [];

        this.state.ranking = [];

        const start =
            this.state.maze.start;

        for (const player of this.players.values()) {

            player.reset(start);

            this.state.players[player.id] =
                player;
        }

        this.io
            .to(this.code)
            .emit(
                "gameStarted",
                this.state.serialize()
            );

        this.startTick();
    }

    startTick() {

        this.stopGame();

        this.lastTick = Date.now();

        this.tickInterval =
            setInterval(
                () => this.tick(),
                1000 / 30
            );
    }

    stopGame() {

        if (this.tickInterval) {

            clearInterval(this.tickInterval);

            this.tickInterval = null;
        }
    }

    tick() {

        if (this.state.status !== "running") {
            return;
        }

        const now = Date.now();

        const delta =
            Math.min(
                (now - this.lastTick) / 1000,
                0.1
            );

        this.lastTick = now;

        for (const player of this.players.values()) {

            if (player.finished) {
                continue;
            }

            this.updatePlayer(
                player,
                delta
            );
        }

        this.io
            .to(this.code)
            .emit(
                "gameState",
                this.state.serialize()
            );
    }

    updatePlayer(player, delta) {

        // Placeholder movement for MVP step.
        // The next implementation will use the maze graph
        // to automatically move between cells.

        if (player.decisionDeadline) {

            if (
                Date.now() >
                player.decisionDeadline
            ) {

                player.decision = null;

                player.decisionDeadline = null;
            }
        }
    }

    handleDirection(id, direction) {

        const player =
            this.players.get(id);

        if (!player) return;

        if (this.state.status !== "running") {
            return;
        }

        const valid =
            ["up", "down", "left", "right"];

        if (!valid.includes(direction)) {
            return;
        }

        player.decision =
            direction;
    }

    placeBarricade(id, data) {

        const player =
            this.players.get(id);

        if (!player) return;

        if (this.state.status !== "running") {
            return;
        }

        if (player.barricadesRemaining <= 0) {
            return;
        }

        const now = Date.now();

        if (
            now - player.lastBarricadeTime <
            5000
        ) {
            return;
        }

        if (
            !data ||
            typeof data.x !== "number" ||
            typeof data.y !== "number"
        ) {
            return;
        }

        this.state.barricades.push({
            id:
                `${player.id}-${now}`,

            x: data.x,
            y: data.y,

            owner: player.id,

            createdAt: now,

            expiresAt:
                now + 8000
        });

        player.barricadesRemaining--;

        player.lastBarricadeTime = now;

        this.io
            .to(this.code)
            .emit(
                "barricadePlaced",
                this.state.barricades
            );
    }

}

module.exports = GameRoom;
