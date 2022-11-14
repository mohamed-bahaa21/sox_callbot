const audio = require('./audio');
var notifier = require('./notifier');
// notifier.emit('recognize-from-microphone-end');

var not_interested_answers = ['not interested', 'no thank you', 'not today', 'nope', 'not interesting'];
var no_call_again_answers = ['not call again', 'stop', 'do not call me again', 'fuck off', 'fuck you'];
var yes_answers = ['yes', 'i do', 'yeah', 'okay', 'ok', 'that\'s fine', 'sure', 'that is fine', 'sir', 'i guess', 'show'];
var no_answers = ['no', 'nope', 'nah', 'now'];
var how_are_you_answers = ['how are you', 'is it going'];

var action;

function evaluateResponse(script_step, response) {
    console.log('evaluateResponse', script_step, response);
    action = 'none';
    
    // console.log('caaaall playFiles....');
    // audio.playFiles(['./sounds/Notinterested_1.wav'], 0);
    // // notifier.emit('back-one-step');

    switch (script_step) {
    case 1:
        console.log('engine path 0');
        audio.playFiles(['./sounds/Intro.wav'], 0);
        break;

    case 2:
        //can you hear me ok?
        if (findMatch(response, no_call_again_answers)) {
            console.log('engine path 1');
            audio.playFiles(['./sounds/Sorry to hear that.wav'], 0);
            // notifier.emit('end-call');
        }

        if (findMatch(response, not_interested_answers)) {
            console.log('engine path 2');
            audio.playFiles(['./sounds/Notinterested_1.wav', './sounds/Notinterested_2.wav'], 0);
            // notifier.emit('back-one-step');
        }

        else if (findMatch(response, how_are_you_answers)) {
            console.log('engine path 3');
            audio.playFiles(['./sounds/Im fine.wav', './sounds/pitch_1.wav', './sounds/pitch_2.wav'], 0);
        }
        else {
            console.log('engine path 4');
            audio.playFiles(['./sounds/pitch_1.wav', './sounds/pitch_2.wav'], 0);
        }
        break;
    case 3:
        //you may qualify ....
        if (findMatch(response, no_call_again_answers)) {
            console.log('engine path 5');
            audio.playFiles(['./sounds/Sorry to hear that.wav'], 0);
            // notifier.emit('end-call');
        }

        if (findMatch(response, not_interested_answers)) {
            console.log('engine path 6');
            audio.playFiles(['./sounds/Notinterested_1.wav', './sounds/Notinterested_2.wav'], 0);
            // notifier.emit('back-one-step');
        }

        else {
            console.log('engine path 7');
            audio.playFiles(['./sounds/opt.wav'], 0);
        }

        break;
    case 4:
        if (findMatch(response, no_call_again_answers)) {
            console.log('engine path 8');
            audio.playFiles(['./sounds/Sorry to hear that.wav'], 0);
            // notifier.emit('end-call');
        }

        if (findMatch(response, not_interested_answers)) {
            console.log('engine path 9');
            audio.playFiles(['./sounds/Notinterested_1.wav', './sounds/Notinterested_2.wav'], 0);
            // notifier.emit('back-one-step');
        }

        else if (findMatch(response, yes_answers)) {
            console.log('engine path 10');
            audio.playFiles(['./sounds/PartA&B.wav'], 0);
        }
        break;
    case 5:
        //do you have part a and b
        if (findMatch(response, no_call_again_answers)) {
            console.log('engine path 11');
            audio.playFiles(['./sounds/Sorry to hear that.wav'], 0);
            // notifier.emit('end-call');
        }

        if (findMatch(response, not_interested_answers)) {
            console.log('engine path 12');
            audio.playFiles(['./sounds/Notinterested_1.wav', './sounds/Notinterested_2.wav'], 0);
            // notifier.emit('back-one-step');
        }

        else if (findMatch(response, yes_answers)) {
            console.log('engine path 13');
            audio.playFiles(['./sounds/Goodtohear.wav', './sounds/age.wav'], 0);
        }

        else if (findMatch(response, no_answers)) {
            console.log('engine path 14');
            audio.playFiles(['./sounds/age.wav'], 0);
        }

        else {
            console.log('engine path 14-5');
            audio.playFiles(['./sounds/saythatagain.wav'], 0);
            // notifier.emit('back-one-step');
            // action = 'back-one';
        }
        break;
    case 6:
        //are you currently at least 64 years of age?
        break;
    case 6:
        if (findMatch(response, no_call_again_answers)) {
            console.log('engine path 15');
            audio.playFiles(['./sounds/Sorry to hear that.wav'], 0);
            // notifier.emit('end-call');
        }

        if (findMatch(response, not_interested_answers)) {
            console.log('engine path 16');
            audio.playFiles(['./sounds/Notinterested_1.wav', './sounds/Notinterested_2.wav'], 0);
            // notifier.emit('back-one-step');
        }

        else if (findMatch(response, yes_answers)) {
            console.log('engine path 17');
            audio.playFiles(['./sounds/Transferconsent.wav'], 0);
            // notifier.emit('transfer-call');
        }
        break;

    default:
        audio.playFiles(['./sounds/Hello.wav'], 0);
        break;
}

    
    /* goodbye ?
    else if (findMatch(response, no_answers)){
        console.log('engine path 18');
        audio.playFiles(['./sounds/age.wav'],0);
    }
    */
}

function findMatch(response, group) {
    var found_match = false;
    group.forEach(function (x) {
        if (response.indexOf(x) > -1) found_match = true;
    });

    return found_match;
}

function getAction() {
    return action;
}

module.exports = {
    evaluateResponse: evaluateResponse,
    getAction: getAction
}









// switch (script_step) {
//     case 1:
//         console.log('engine path 0');
//         /*
//         - audio started playing

//         - audio_is_playing_o:  false
//         - audio_is_playing:  false

//         - finished playing ./sounds/Intro.wav

//         - Else: play next...
//         - { audios: [ './sounds/Intro.wav' ], idx: 1 }

//         - here vsok-1
//         - hello

//         - audio_is_playing_o:  true
//         - audio_is_playing:  true
        
//         - which 3

//         - here vosk-start-1-1
//         - here vosk-start-1-1
//         - here vosk-start-1-1
//         */
//         audio.playFiles(['./sounds/Intro.wav'], 0);
//         break;

//     case 2:
//         //can you hear me ok?
//         if (findMatch(response, no_call_again_answers)) {
//             console.log('engine path 1');
//             audio.playFiles(['./sounds/Sorry to hear that.wav'], 0);
//             // notifier.emit('end-call');
//         }

//         if (findMatch(response, not_interested_answers)) {
//             console.log('engine path 2');
//             audio.playFiles(['./sounds/Notinterested_1.wav', './sounds/Notinterested_2.wav'], 0);
//             // notifier.emit('back-one-step');
//         }

//         else if (findMatch(response, how_are_you_answers)) {
//             console.log('engine path 3');
//             audio.playFiles(['./sounds/Im fine.wav', './sounds/pitch_1.wav', './sounds/pitch_2.wav'], 0);
//         }
//         else {
//             console.log('engine path 4');
//             /*
//                 - audio started playing

//                 - finished playing ./sounds/pitch_1.wav

//                 - If: play next...
//                 - { audios: [ './sounds/pitch_1.wav', './sounds/pitch_2.wav' ], idx: 1 }
//                 - finished playing ./sounds/pitch_2.wav

//                 - Else: play next...
//                 - { audios: [ './sounds/pitch_1.wav', './sounds/pitch_2.wav' ], idx: 2 }

//                 - here vsok-1
//                 - yeah
//                 - here vosk-start-1-1
//                 - audio started playing
//                 - here vosk-start-1-1
//             */
//             audio.playFiles(['./sounds/pitch_1.wav', './sounds/pitch_2.wav'], 0);
//         }
//         break;
//     case 3:
//         //you may qualify ....
//         if (findMatch(response, no_call_again_answers)) {
//             console.log('engine path 5');
//             audio.playFiles(['./sounds/Sorry to hear that.wav'], 0);
//             // notifier.emit('end-call');
//         }

//         if (findMatch(response, not_interested_answers)) {
//             console.log('engine path 6');
//             audio.playFiles(['./sounds/Notinterested_1.wav', './sounds/Notinterested_2.wav'], 0);
//             // notifier.emit('back-one-step');
//         }

//         else {
//             console.log('engine path 7');
//             audio.playFiles(['./sounds/opt.wav'], 0);
//         }

//         break;
//     case 4:
//         if (findMatch(response, no_call_again_answers)) {
//             console.log('engine path 8');
//             audio.playFiles(['./sounds/Sorry to hear that.wav'], 0);
//             // notifier.emit('end-call');
//         }

//         if (findMatch(response, not_interested_answers)) {
//             console.log('engine path 9');
//             audio.playFiles(['./sounds/Notinterested_1.wav', './sounds/Notinterested_2.wav'], 0);
//             // notifier.emit('back-one-step');
//         }

//         else if (findMatch(response, yes_answers)) {
//             console.log('engine path 10');
//             audio.playFiles(['./sounds/PartA&B.wav'], 0);
//         }
//         break;
//     case 5:
//         //do you have part a and b
//         if (findMatch(response, no_call_again_answers)) {
//             console.log('engine path 11');
//             audio.playFiles(['./sounds/Sorry to hear that.wav'], 0);
//             // notifier.emit('end-call');
//         }

//         if (findMatch(response, not_interested_answers)) {
//             console.log('engine path 12');
//             audio.playFiles(['./sounds/Notinterested_1.wav', './sounds/Notinterested_2.wav'], 0);
//             // notifier.emit('back-one-step');
//         }

//         else if (findMatch(response, yes_answers)) {
//             console.log('engine path 13');
//             audio.playFiles(['./sounds/Goodtohear.wav', './sounds/age.wav'], 0);
//         }

//         else if (findMatch(response, no_answers)) {
//             console.log('engine path 14');
//             audio.playFiles(['./sounds/age.wav'], 0);
//         }

//         else {
//             console.log('engine path 14-5');
//             audio.playFiles(['./sounds/saythatagain.wav'], 0);
//             // notifier.emit('back-one-step');
//             // action = 'back-one';
//         }
//         break;
//     case 6:
//         //are you currently at least 64 years of age?
//         break;
//     case 6:
//         if (findMatch(response, no_call_again_answers)) {
//             console.log('engine path 15');
//             audio.playFiles(['./sounds/Sorry to hear that.wav'], 0);
//             // notifier.emit('end-call');
//         }

//         if (findMatch(response, not_interested_answers)) {
//             console.log('engine path 16');
//             audio.playFiles(['./sounds/Notinterested_1.wav', './sounds/Notinterested_2.wav'], 0);
//             // notifier.emit('back-one-step');
//         }

//         else if (findMatch(response, yes_answers)) {
//             console.log('engine path 17');
//             audio.playFiles(['./sounds/Transferconsent.wav'], 0);
//             // notifier.emit('transfer-call');
//         }
//         break;

//     default:
//         audio.playFiles(['./sounds/Hello.wav'], 0);
//         break;
// }
