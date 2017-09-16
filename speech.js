const Speech = require("@google-cloud/speech");

const speech = Speech();
const config = {
    "encoding": "BASE64",
    "sampleRateHertz": 16000,
    "languageCode": "en-US"
};

exports.decodeSpeech = (audio) => {
    const request = {
        "config": config,
        "audio": audio
    }
    speech.recognize(request)
        .then((data) => {
            const response = data[0];
            const transcription = response.results.map(result =>
                result.alternatives[0].transcript).join('\n');
            console.log(transcription);
        }).catch((err) => {
            console.log(err);
        });
}