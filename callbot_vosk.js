const fs = require('fs');
const engine = require('./engine');
var vosk = require('./module/vosk');
vosk.setLogLevel(0);

const recorder = require('node-record-lpcm16');
var notifier = require('./notifier');
const audio = require('./audio');
var audio_transcription;

const async = require('async');
const que = async.queue(completedFn, 1);


MODEL_PATH = "model"
const model = new vosk.Model(MODEL_PATH);
const sampleRateHertz = 16000;
const recording = recorder.record({
    // Other options, see https://www.npmjs.com/package/node-record-lpcm16#options
    channels: 1,
    sampleRate: sampleRateHertz,
    endOnSilence: false,
    keepSilence: true,
    recorder: 'sox', // Try also "arecord" or "sox"
});


class VAD {
    constructor() {
        this.id = "VADClass";
        this._speechTime = 0;
        this._silenceTime = 0;
        this._isSpeech = false;
        this._speechFrames = []
    }

    get speechTime() {
        return this._speechTime;
    }

    set speechTime(speechTime) {
        this._speechTime = speechTime;
    }

    get silenceTime() {
        return this._silenceTime;
    }

    set silenceTime(silenceTime) {
        this._silenceTime = silenceTime;
    }

    get isSpeech() {
        return this._isSpeech;
    }

    set isSpeech(isSpeech) {
        this._isSpeech = isSpeech;
    }

    clearSpeechFrames() {
        this._speechFrames = [];
    }

    writeWav() {
        if (this._speechFrames.length > 0) {
            const filename = `test_${new Date().getTime()}.wav`;
            const file = new FileWriter(filename, { sampleRate: sampleRateHertz, channels: 1 });

            var frames = this._speechFrames;
            var that = this;
            for (let i = 0; i < frames.length; i++) {
                file.write(frames[i], function () {
                    if (i === frames.length - 1) {
                        file.end();
                        console.log(filename, ' - completed')
                        //that.getSTTResult(filename);
                    }
                });
            }
        }
    }


    updateChunkData(frameData) {
        // arrayBuffer =  [ 4, 4, 5, 6, 6, 7, 8, 9 ];
        var arryBufferInt16 = new Int16Array(frameData.buffer);
        var arrayMean = arryBufferInt16.reduce((a, b) => a + b * b / arryBufferInt16.length, 0);
        arrayMean = Math.sqrt(arrayMean);
        arrayMean /= 32767;
        var speechTr = 0.005;

        // frame buffer time
        var frameTime = arryBufferInt16.length / sampleRateHertz;

        // check if current frame is speech
        if (arrayMean > speechTr) {
            this.speechTime = this.speechTime + frameTime;

            if (this.speechTime > 0.1) {
                // update speech
                this.isSpeech = true;

                // reset silence time
                this.silenceTime = 0
            }

            // push speech frames
            this._speechFrames.push(frameData);
        }
        else {
            this.silenceTime = this.silenceTime + frameTime;

            // silence case
            if (this.isSpeech && this.silenceTime >= 0.5) {
                // set no speech
                this.speechTime = 0;
                this.isSpeech = false;
                //console.log(arrayMean);
                this.clearSpeechFrames();
            }
        }
    }

    updateInformation(arrayBuffer) {
        // calculate chunk data
        var chunkSize = 1600; // 50ms
        var chunkNum = Math.floor(arrayBuffer.byteLength / chunkSize);

        // update chunk vad information
        for (let i = 0; i < chunkNum - 1; i++) {
            var stIdx = i * chunkSize;
            var endIdx = (i + 1) * chunkSize;
            this.updateChunkData(arrayBuffer.slice(stIdx, endIdx));
        }

        // update final chunk data in this frame
        this.updateChunkData(arrayBuffer.slice((chunkNum - 1) * chunkSize, arrayBuffer.byteLength));
    }

    sayStatus() {
        if (this.isSpeech) {
            console.log("speaking");
        }
        else {
            console.log("silent");
        }
    }
}

class RestartableRecogniser {
    constructor({ model, textCallback }) {
        this.model = model;
        this.textCallback = textCallback;
        this.recStream = null;
        this.started = false;
    }

    start() {
        if (this.started) {
            // console.log('callbot_vosk start: ', this);
            return;
        }
        // console.log('callbot_vosk start: ', this);
        this.recStream = new vosk.Recognizer({ model: model, sampleRate: sampleRateHertz });
        this.started = true;
    }

    stop() {
        if (!this.started) {
            // console.log('callbot_vosk stop: ', this);
            return;
        }
        // console.log('callbot_vosk stop: ', this);
        this._clearRecStream();
        this.started = false;
    }

    restart() {
        this.stop();
        this.start();
    }

    write(buf) {
        if (!this.started) {
            return;
        }
        if (this.recStream.acceptWaveform(buf))
            this.textCallback(this.recStream.result().text);
        else
            this.textCallback(this.recStream.partialResult().partial);
    }

    _clearRecStream() {
        if (!this.recStream) {
            return;
        }

        if (!que.paused) {
            let result = this.recStream.finalResult();
            console.log('callbot_vosk _clearRecStream: ', result);
            console.log('callbot_vosk audio_transcription: ', audio_transcription);
            this.textCallback(result.text)
            this.recStream.free();
            this.recStream = null;
        }
    }
}

function completedFn(data, completed) {

    if (!audio.audioIsPlaying()) {
        recognizer.write(data);
    }

    var statusBefore = vad.isSpeech;
    vad.updateInformation(data);
    var statusNow = vad.isSpeech;

    if (statusBefore && !statusNow) {
        recognizer.restart();
    }

    const remaining_task = que.length();
    // console.log('====================================');
    // console.log("REMAINING: ", remaining_task);
    // console.log('====================================');

    completed(null, { data, remaining_task });
}

function pauseMicRecognizer() {
    // recording.pause();
    recognizer.stop();
    que.pause();
}

function resumeMicRecognizer() {
    // script_step++;
    // console.log('====================================');
    // console.log(script_step);
    // console.log('====================================');
    // recording.resume();
    audio_transcription = undefined;
    recognizer.start();
    que.resume();
}

var vad = new VAD();
let silence_ctr = 0;
let script_step = 0;
var recognizer = new RestartableRecogniser({
    model: model,
    textCallback: (data) => {
        if ((audio_transcription == undefined) && !audio.audioIsPlaying() && data) {
            audio_transcription = data;
            console.log('caaaall evaluateResponse....');
            // que.pause();
            // recording.pause();
            // recognizer.stop();
            script_step++;
            engine.evaluateResponse(script_step, audio_transcription);
        }
    },
});


// if (!recording.isPaused()) {
//     recording.pause();
//     engine.evaluateResponse(1, audio_transcription);
// }

function recognizeFromMicrophone() {
    console.log('here vosk-start-1');
    // stepFunction();
    // recognizer.start();

    // if(!audio.audioIsPlaying && que.paused) {
    //     que.resume();
    // }

    recording
        .stream()
        .on('data', function (data) {
            if (que.length() < 1) {
                que.push(data, (err, { data, remaining }) => {
                    console.log('here vosk-start-1-1');
                    // console.log('====================================');
                    // console.log(que.length());
                    // console.log('====================================');
                    // console.log("recording isPaused: ", recording.isPaused());
                    // notifier.emit('recognize-from-microphone-end');
                    // audio_transcription = data;
                    // console.log('Memory Usage: ', process.memoryUsage());
                    if (err) {
                        console.log(`there is an error  in the task ${data}`);
                    }
                });
            } else {
                console.log('====================================');
                console.log('what the f*ck do you want !!!');
                console.log('====================================');
            }
        })
        .on('end', function () {
            console.log('recording ended')
            // recognizer.stop();
        });
}

function audioTranscription() {
    console.log('here vsok-1');
    console.log(audio_transcription);
    return audio_transcription;
}

module.exports = {
    audioTranscription: audioTranscription,
    recognizeFromMicrophone: recognizeFromMicrophone,
    pauseMicRecognizer: pauseMicRecognizer,
    resumeMicRecognizer: resumeMicRecognizer,
}