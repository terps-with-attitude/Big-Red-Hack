const utils = require("./utils");
const config = require("./config");

exports.createUser = (name, existingUsers = []) => {
    let id = utils.genId(config.userIdLength);
    while (existingUsers.indexOf(id) > -1) {
        id = utils.genId(config.userIdLength);
    }

    return {
        "name": name,
        "id": id
    };
}