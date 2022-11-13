const vosk = require('./callbot_vosk');
const engine = require('./engine');
const audio = require('./audio');
var notifier = require('./notifier')

var audio_transcription;
var audio_transcription_o;
var audio_transcription_m;
var audio_transcription_mo;
var action_o;
var silence_ctr = undefined;
var audio_is_playing = false;
var audio_is_playing_o;
var script_step = 1;
var processInterval;

//startInterval();
var trackerTimeout;
var caller;
var step_is_running = false;


notifier.on('recognize-from-microphone-end', () => {
    console.log('recognize-from-microphone-end');
    stepFunction();
});

notifier.on('audio-finished-playing', () => {
    console.log('audio finished playing');
    audio_is_playing = false;
    // stepFunction();
});

notifier.on('audio-started-playing', () => {
    console.log('audio started playing');
    audio_is_playing = true;
});

notifier.on('back-one-step', () => {
    console.log('back one level');
    script_step -= 1;
    //stepFunction();
});

notifier.on('end-call', () => {
    console.log('end call');
    script_step -= 1;
});

notifier.on('transfer-call', () => {
    console.log('success, transfer call...');
    //script_step -=1;
});

function stepFunction() {
    audio_is_playing = audio.audioIsPlaying();
    var action = engine.getAction();

    if (action != action_o) {
        if (action == 'back-one') {
            console.log('which 1');
            script_step -= 1
        };
    }

    if (audio_is_playing == false) {
        audio_transcription = vosk.audioTranscription();
    } else {
        audio_transcription = undefined
    }

    if (audio_transcription == audio_transcription_o) {
        audio_transcription = undefined;
    }

    //get audio transcription
    if (audio_transcription == undefined) {
        silence_ctr++;
    }

    if (audio_transcription) {
        console.log('call active, user says: ', audio_transcription);
        audio_transcription_m = audio_transcription;
        silence_ctr = 0;

    } else {
        if (silence_ctr >= 2 && audio_transcription_m) {
            //play audio file
            if (audio_is_playing != true) {
                console.log('which 2');
                //play_audio_command = true;
                engine.evaluateResponse(script_step, audio_transcription_m);
                audio_transcription_m = undefined;
                script_step++;
            }
        }
    }

    if (audio_is_playing != audio_is_playing_o) {
        console.log('audio_is_playing_o: ', audio_is_playing_o);
        console.log('audio_is_playing: ', audio_is_playing_o);
        // if (audio_is_playing == false) {
        //     console.log('which 3');
        //     // script_step++;
        // }
    }

    if (audio_transcription) {
        console.log('which 4');
        audio_transcription_o = audio_transcription;
    }
    if (audio_transcription_m) {
        console.log('which 5');
        audio_transcription_mo = audio_transcription_m;
    }

    audio_is_playing_o = audio_is_playing;

    // console.log('step .99');
    // setTimeout(() => {
    //     stepFunction();
    // }, 500);

}

stepFunction();
vosk.recognizeFromMicrophone();

let _maxMemoryConsumption = 0;
let _dtOfMaxMemoryConsumption;

process.nextTick(() => {
    let memUsage = process.memoryUsage();
    if (memUsage.rss > _maxMemoryConsumption) {
        _maxMemoryConsumption = memUsage.rss;
        _dtOfMaxMemoryConsumption = new Date();
    }
});


process
    .on('SIGHUP', function () {
        log.message.info("[%s] Asterisk process hung up.", that.callerid);
        that.exitWhenReady(true);
    })
    .on('exit', function () {
        console.log(`Max memory consumption: ${_maxMemoryConsumption} at ${_dtOfMaxMemoryConsumption}`);
        process.kill(process.pid, 'SIGTERM');
    });