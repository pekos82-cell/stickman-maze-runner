const COLORS = [
    "#e63946",
    "#457b9d",
    "#2a9d8f",
    "#f4a261",
    "#9b5de5",
    "#00b4d8",
    "#f72585",
    "#6a994e"
];

const NAMES = [
    "Fast Fox",
    "Crazy Cat",
    "Turbo Duck",
    "Maze Ninja",
    "Speedy Bot",
    "Doodle Dash",
    "Runner X",
    "Maze Ghost"
];

class Player {

    constructor(id, nickname, index) {

        this.id = id;

        this.nickname =
            nickname?.trim() ||
            `${NAMES[index % NAMES.length]} ${index + 1}`;

        this.color =
            COLORS[index % COLORS.length];

        this.index = index;

        this.position = {
            x: 0,
            y: 0
        };

        this.direction = null;

        this.finished = false;
        this.finishPosition = null;

        this.barricadesRemaining = 3;
        this.lastBarricadeTime = 0;

        this.decision = null;
        this.decisionDeadline = null;
    }

    reset(startPosition) {

        this.position = {
            ...startPosition
        };

        this.direction = null;

        this.finished = false;
        this.finishPosition = null;

        this.barricadesRemaining = 3;

        this.lastBarricadeTime = 0;

        this.decision = null;
        this.decisionDeadline = null;
    }

    serialize() {

        return {
            id: this.id,
            nickname: this.nickname,
            color: this.color,
            x: this.position.x,
            y: this.position.y,
            direction: this.direction,
            finished: this.finished,
            finishPosition: this.finishPosition,
            barricadesRemaining:
                this.barricadesRemaining
        };
    }
}

module.exports = Player;
