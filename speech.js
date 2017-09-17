const speech = require("@google-cloud/speech")({
    "projectId": "lecture-me-1505571511176",
    "keyFilename": "keyfile.json"
});
const config = {
    "encoding": "LINEAR16",
    "sampleRateHertz": 44100,
    "languageCode": "en-US"
};

exports.transcribe = (audio, callback = () => { }) => {
    const request = {
        "config": config,
        "audio": {
            "content": audio
        }
    };
    speech.recognize(request)
        .then((data) => {
            const response = data[0];
            const transcription = response.results.map(result =>
                result.alternatives[0].transcript).join('\n');
            callback(null, transcription);
        }).catch((err) => {
            callback(err);
        });
}