// Local imports
const room = require("./room");
const user = require("./user");
const config = require("./config");

// Express/endpoints setup
const app = require("express")();
const http = require("http").Server(app);
const io = require("socket.io")(http);
const bodyParser = require("body-parser");
const cors = require("cors");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

// Current active rooms
let rooms = {};

// REST endpoints

/*
    POST /createroom
    
    Request parameters: 
        name: Name of session host
    Response parameters:
        room_id: ID that uniquely identifies the room
            (used for students to join)
*/
app.post("/createroom", (req, res) => {
    const hostName = req.body ? req.body.name : null;
    if (!hostName) {
        res.status(500).send("Error: name field required");
    } else {
        const newRoom = room.createRoom(hostName);
        rooms[newRoom.id] = newRoom;

        res.status(200).send({
            "room_id": newRoom.id
        });
        console.log(`Room ${newRoom.id} created`);

        waitForConnection();
    }
});

/*
    POST /newquestion
    
    Request parameters: 
        uid: Asker's userID
        rid: Room ID for question
        question: Question text
    Response parameters: none (status code only)
*/

app.post("/newquestion", (req, res) => {
    const uid = req.body ? req.body.uid : null;
    const rid = req.body ? req.body.rid : null;
    const question = req.body ? req.body.question : null;

    if (uid && rid && question) {
        queueQuestion(uid, rid, question);
        res.sendStatus(200);
    } else {
        res.status(500).send("userID, roomID, or question text is missing");
    }
});

// Start the app
app.listen(config.port, () => {
    console.log(`Server started on port ${config.port}`);
});

// Utility functions

// Waits for a socket connection after a room is created
function waitForConnection() {
    io.on("connection", (socket) => {
        socket.on("start", (id) => {
            if (rooms[id]) {
                rooms[id].socket = socket;
                console.log(rooms[id].socket);
                socket.emit(`Room socket created for ${id}`);
            } else {
                socket.emit(`Room ${id} has not yet been created`);
            }
        });
    });
}

// Queues a question for the room
function queueQuestion(uid, rid, question) {
    rooms[rid].questions.push({
        "user": rooms[rid].users[uid],
        "text": question
    });
}