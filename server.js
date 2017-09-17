// Local imports
const room = require("./room");
const user = require("./user");
const config = require("./config");
const speech = require("./speech");

// External dependencies
const fs = require("fs");
const base64url = require("base64url");
const wav = require("wav");

// Express/endpoints setup
const app = require("express")();
const http = require("http").Server(app);
const io = require("socket.io")(http);
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.raw({ "limit": "500 mb" }));
app.use(bodyParser.json());

// Current active rooms
let rooms = {};

// REST endpoints

/*
    POST /createroom
    
    Request parameters: none
    Response parameters:
        room_id: ID that uniquely identifies the room
            (used for students to join)
*/
app.post("/createroom", (req, res) => {
    const newRoom = room.createRoom();
    rooms[newRoom.id] = newRoom;

    res.status(200).send({
        "room_id": newRoom.id
    });
    console.log(`Room ${newRoom.id} created`);
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

/*
    GET /getquestions
    
    Request parameters: 
        rid: Room ID
    Response parameters:
        questions: Array of {user: User, text: str} objects representing
            pending questions
*/

app.post("/getquestions", (req, res) => {
    const rid = req.body ? req.body.rid : null;
    if (!rid) {
        res.status(500).send("Room ID (rid) field required");
    } else {
        res.status(200).send({
            "questions": rooms[rid].questions
        })
    }
});

/*
    POST /removequestion
    
    Request parameters: 
        rid: Room ID
    Response parameters: none (status code only)
*/

app.post("/removequestion", (req, res) => {
    const rid = req.body ? req.body.rid : null;
    const text = req.body ? req.body.text : null;
    if (!rid || !text) {
        res.status(500).send("Room ID (rid) and text fields required");
    } else {
        try {
            const texts = rooms[rid].questions.map(q => q.text);
            const index = texts.indexOf(text);
            rooms[rid].questions.pop(index);

            res.sendStatus(200);
        } catch (e) {
            res.status(500).send("Question couldn't be removed – list is empty");
        }
    }
});

/*
    POST /newaudio
    
    Request parameters: 
        rid: Room ID
        data: Base64-encoded audio
    Response parameters: none (status code only)

*/

app.post("/newaudio", (req, res) => {
    const rid = req.body ? req.body.rid : null;
    const data = req.body ? req.body.data : null;
    const decoded = base64url.decode(data);
    console.log(decoded);
    // fs.writeFileSync("audio.3gp", decoded);
    if (!rid || !data) {
        res.status(500).send("Room ID (rid) and base 64-encoded data required for this endpoint");
    } else {
        speech.transcribe(data, (err, transcription) => {
            if (err) {
                res.status(500).send(`Transcription failed with error ${err}`);
            } else {
                console.log(transcription);
                res.sendStatus(200);
            }
        });
    }
});

/*
    POST /transcript
    
    Request parameters: 
        rid: Room ID
    Response parameters:
        text: Current text of transcript

*/

app.post("/transcript", (req, res) => {
    const rid = req.body ? req.body.rid : null;
    if (!rid || !rooms[rid]) {
        res.status(500).send("Room ID required for this endpoint");
    } else {
        res.status(200).send({
            "text": rooms[rid].transcript
        });
    }
});

// Start the app
app.listen(config.port, () => {
    console.log(`Server started on port ${config.port}`);
    waitForConnections();
});

// Utility functions

// Waits for socket connections from a user
function waitForConnections() {
    io.on("connection", (socket) => {
        socket.on("start", (data) => {
            const rid = data["rid"];
            const name = data["name"];
            let connected = true;
            if (rooms[rid]) {
                const uid = user.createUser(name, rooms[rid].users);
                rooms[rid].users[uid].socket = socket;
            } else {
                connected = false;
            }
            socket.emit("join", { "status": `User ${connected ? "connected" : "not connected"}` });
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