const chars = "abcdefghijklmnopqrstuvwxyz0123456789"; // Alphanumeric IDs

/*
    Generates an alphanumeric ID given a desired length.
*/
exports.genId = (length) => {
    let id = "";
    for (let i = 0; i < length; i++) {
        id += chars[Math.floor(Math.random() * chars.length)];
    }
    return id;
}