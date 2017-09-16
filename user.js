const utils = require("./utils");
const config = require("./config");

exports.createUser = (name, existingUsers = new Set()) => {
    let id = utils.genId(config.userIdLength);
    while (existingUsers.has(id)) {
        id = utils.genId(config.userIdLength);
    }

    return {
        "name": name,
        "id": id
    };
}