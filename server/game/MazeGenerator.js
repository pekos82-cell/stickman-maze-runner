class MazeGenerator {

    static generate(width = 21, height = 15) {

        const grid = [];

        for (let y = 0; y < height; y++) {

            grid[y] = [];

            for (let x = 0; x < width; x++) {

                grid[y][x] = {
                    x,
                    y,
                    open: false
                };

            }
        }

        // Simple procedural path generation
        for (let y = 1; y < height - 1; y += 2) {

            for (let x = 1; x < width - 1; x++) {

                grid[y][x].open = true;

                if (Math.random() < 0.35) {

                    grid[y][x + 1].open = true;
                }
            }
        }

        // Vertical connectors
        for (let x = 1; x < width - 1; x += 2) {

            for (let y = 1; y < height - 1; y++) {

                if (Math.random() < 0.45) {

                    grid[y][x].open = true;
                }
            }
        }

        // Guarantee start/end
        grid[Math.floor(height / 2)][0].open = true;
        grid[Math.floor(height / 2)][1].open = true;

        grid[Math.floor(height / 2)][width - 2].open = true;
        grid[Math.floor(height / 2)][width - 1].open = true;

        return {
            width,
            height,
            grid,

            start: {
                x: 0,
                y: Math.floor(height / 2)
            },

            exit: {
                x: width - 1,
                y: Math.floor(height / 2)
            }
        };
    }

}

module.exports = MazeGenerator;
