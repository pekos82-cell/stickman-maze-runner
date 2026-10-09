const MazeGenerator = require("./MazeGenerator");

class GameState {

    constructor() {

        this.status = "waiting";

        this.round = 0;

        this.maze = null;

        this.players = {};

        this.barricades = [];

        this.startedAt = null;

        this.decisionTimer = null;

        this.ranking = [];
    }

    createMaze() {

        this.maze =
            MazeGenerator.generate(21, 15);
    }

    serialize() {

        return {
            status: this.status,
            round: this.round,

            maze: this.maze,

            players: Object.values(this.players)
                .map(player => player.serialize()),

            barricades: this.barricades,

            ranking: this.ranking
        };
    }

}

module.exports = GameState;
