const mineflayer = require("mineflayer");
const mineflayerViewer = require("prismarine-viewer").mineflayer;
const {
    pathfinder,
    Movements,
    goals: { GoalNear },
} = require("mineflayer-pathfinder");

const bot = mineflayer.createBot({
    host: process.argv[2],
    port: parseInt(process.argv[3]),
    auth: "microsoft",
});

bot.loadPlugin(pathfinder);

bot.once("spawn", () => {
    mineflayerViewer(bot, { port: 3007, firstPerson: true });
});

bot.once("spawn", () => {
    const defaultMove = new Movements(bot);
    const RANGE_GOAL = 0;

    bot.on("chat", (username, message) => {
        if (username === bot.username) return;
        if (message !== "come") return;
        const target = bot.players[username]?.entity;
        if (!target) {
            bot.chat("I don't see you !");
            return;
        }
        const { x: playerX, y: playerY, z: playerZ } = target.position;

        bot.pathfinder.setMovements(defaultMove);
        bot.pathfinder.setGoal(
            new GoalNear(playerX, playerY, playerZ, RANGE_GOAL)
        );
    });

    bot.on("chat", (username, message) => {
        if (username === bot.username) return;
		const coords = message.split(' ');
		if (coords[0] !== 'goto') return;
		for (let i = 0; i < coords.length; i++) {
			coords[i] = parseInt(coords[i])
		}
		bot.pathfinder.setMovements(defaultMove)
		bot.pathfinder.setGoal(new GoalNear(coords[1], coords[2], coords[3], RANGE_GOAL))
    });
});

bot.on("spawn", () => {
    bot.on("chat", (username, message) => {
        if (message === "attack me") attackPlayer(username);
        else if (message === "attack") attackEntity();
        else if (message === "jump") jump();
    });
});

function jump() {
    if (bot.getControlState("jump") === true)
        bot.setControlState("jump", false);
    else if (bot.getControlState("jump") === false)
        bot.setControlState("jump", true);
}

function attackPlayer(username) {
    if (username === bot.username) return;
    const player = bot.players[username];
    if (!player || !player.entity) {
        bot.chat("I can't see you");
    } else {
        bot.chat(`Attacking ${player.username}`);
        bot.attack(player.entity);
    }
}

function attackEntity() {
    const entity = bot.nearestEntity();
    if (!entity) {
        bot.chat("No nearby entities");
    } else if (
        entity.type === "player" ||
        entity.type === "passive" ||
        entity.type === "hostile" ||
        entity.type === "animal"
    ) {
        bot.chat(`Attacking ${entity.name ?? entity.username}`);
        bot.attack(entity);
    } else {
        bot.chat(`No nearby mobs/players`);
    }
}

// Log errors and kick reasons:
bot.on("kicked", console.log);
bot.on("error", console.log);
