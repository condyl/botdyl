const mineflayer = require("mineflayer");
const mineflayerViewer = require("prismarine-viewer").mineflayer;
const {
    pathfinder,
    Movements,
    goals: { GoalNear, GoalNearXZ },
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

bot.on("spawn", () => {
    bot.on("chat", (username, message) => {
        if (message === "attack me") attackPlayer(username);
        else if (message === "attack") attackEntity();
        else if (message === "jump") jump();
        else if (message === "walk") walk();
        else if (message === "come") come(username);
        else if (message.split(" ")[0] === "goto") goto(username, message);
    });
});

function goto(username, message) {
    const defaultMove = new Movements(bot);
    defaultMove.allowFreeMotion = true;
    const RANGE_GOAL = 0;

    const coords = message.split(" ");
    if (coords[0] !== "goto") return;
    for (let i = 0; i < coords.length; i++) {
        coords[i] = parseInt(coords[i]);
    }
    bot.pathfinder.setMovements(defaultMove);
    console.log(coords);
    if (coords.length === 4) {
        bot.pathfinder.setGoal(
            new GoalNear(coords[1], coords[2], coords[3], RANGE_GOAL)
        );
    } else if (coords.length === 3) {
        bot.pathfinder.setGoal(
            new GoalNearXZ(coords[1], coords[2], RANGE_GOAL)
        );
    }
    
}

function come(username) {
    const defaultMove = new Movements(bot);
    defaultMove.allowFreeMotion = true;
    const RANGE_GOAL = 0;

    const target = bot.players[username]?.entity;
    if (!target) {
        bot.chat("I don't see you !");
        console.log(`Bot cannot find player ${target}`);
        return;
    }
    const { x: playerX, y: playerY, z: playerZ } = target.position;

    bot.pathfinder.setMovements(defaultMove);
    bot.pathfinder.setGoal(new GoalNear(playerX, playerY, playerZ, RANGE_GOAL));
    console.log(`Going to ${target.position}`);
}

function walk() {
    if (bot.getControlState("forward") === true) {
        console.log("Stopped Walking");
        bot.setControlState("forward", false);
    } else if (bot.getControlState("forward") === false) {
        console.log("Started Walking");
        bot.setControlState("forward", true);
    }
}

function jump() {
    if (bot.getControlState("jump") === true) {
        console.log("Stopped Jumping");
        bot.setControlState("jump", false);
    } else if (bot.getControlState("jump") === false) {
        console.log("Started Jumping");
        bot.setControlState("jump", true);
    }
}

function attackPlayer(username) {
    if (username === bot.username) return;
    const player = bot.players[username];
    if (!player || !player.entity) {
        bot.chat("I can't see you");
        console.log(`Bot cannot find player ${players}`);
    } else {
        bot.chat(`Attacking ${player.username}`);
        console.log(`Attacking ${player.username}`);
        bot.attack(player.entity);
    }
}

function attackEntity() {
    const entity = bot.nearestEntity();
    if (!entity) {
        bot.chat("No nearby entities");
        console.log("No nearby entities");
    } else if (
        entity.type === "player" ||
        entity.type === "passive" ||
        entity.type === "hostile" ||
        entity.type === "animal"
    ) {
        bot.chat(`Attacking ${entity.name ?? entity.username}`);
        console.log(`Attacking ${entity.name ?? entity.username}`);
        bot.attack(entity);
    } else {
        bot.chat(`No nearby mobs/players`);
        console.log(`No nearby mobs/players`);
    }
}

/*
let lastpos = {
    x: 0,
    y: 0,
    z: 0
};
bot.on("move", () => {
    if (bot.entity.position.x !== lastpos.x && bot.entity.position.z !== lastpos.z) {
        console.log(bot.entity.position)
        lastpos = bot.entity.position;
    } else {
        lastpos = bot.entity.position;
    }
})
*/

// Log errors and kick reasons:
bot.on("login", console.log);
bot.on("kicked", console.log);
bot.once("login", () => {
    console.info("Bot logged in");
});
