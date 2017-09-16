const config = require("./config");
const utils = require("./utils");
const user = require("./user");

let rooms = new Set();

exports.createRoom = (hostName) => {
    let id = utils.genId(config.roomIdLength);
    while (rooms.has(id)) { // Prevent duplicates
        id = utils.genId(config.roomIdLength);
    }
    rooms.add(id);

    return {
        "id": id,
        "users": [],
        "host": user.createUser(hostName),
        "muted": []
    };
}