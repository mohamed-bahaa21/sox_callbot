const Speaker = require('speaker');
var fs = require('fs');
var notifier = require('./notifier');
const lame = require("@suldashi/lame");
var vosk = require('./callbot_vosk');

// var speaker;
// var audioStream;

audio_files = {
  './sounds/Intro.wav': 5000,
  './sounds/Im fine.wav': 1500,
  './sounds/Notinterested_1.wav': 2000,
  './sounds/Notinterested_2.wav': 9000,
  './sounds/opt.wav': 2000,
  './sounds/PartA&B.wav': 4000,
  './sounds/pitch_1.wav': 3000,
  './sounds/pitch_2.wav': 7200,
  './sounds/Sorry to hear that.wav': 500,
  './sounds/Transferconsent.wav': 9000,
  './sounds/Goodtohear.wav': 1500,
  './sounds/age.wav': 2000,
  './sounds/saythatagain.wav': 1500,
}

var audio_is_playing = false;
function playFiles(audios, idx) {
  if (!audios[idx]) return;
  notifier.emit('audio-started-playing');

  var audioStream;

  for (let i = 0; i < audios.length; i++) {
    let audio = audios[i];

    var speaker = new Speaker({
      channels: 2,          // 2 channels
      bitDepth: 16,         // 16-bit samples
      sampleRate: 22031.25, // 22031.25 Hz sample rate
      device: 'hw:2,0'
      //device: 'hw:5,0'
    });

    audioStream = fs.createReadStream(audio)
    audio_is_playing = true;

    audioStream.pipe(speaker)
      .on('close', function () {
        // var audio_duration = audio_files[audios[idx]];

        if (i = audios.length) {
          console.log('yeah we reaaaaaaaaaached')
          speaker.end();
          audio_is_playing = false;
          notifier.emit('audio-finished-playing');
          // return;
          // vosk.resumeMicRecognizer();
        }
      });
  }

  console.log('caaaall this functionnnnnn....');

  // vosk.pauseMicRecognizer();
  // var decoder = new lame.Decoder()
  // decoder.pipe(speaker)

  // audioStream.on('error', function (err) {
  //   res.end(err);
  // });

  // audioStream.on('open', function () {
  //   // var audio_duration = audio_files[audios[idx]];
  //   notifier.emit('audio-started-playing');

  // var audioStream = fs.createReadStream(audios[idx], { highWaterMark: 10000 });
  // var speaker = new Speaker({
  //   channels: 2,          // 2 channels
  //   bitDepth: 16,         // 16-bit samples
  //   sampleRate: 22031.25, // 22031.25 Hz sample rate
  //   device: 'hw:2,0'
  //   //device: 'hw:5,0'
  // });

  // audio_is_playing = true;

  // audioStream.pipe(speaker)
  //   .on('close', function () {
  //     // var audio_duration = audio_files[audios[idx]];

  //     audio_is_playing = false;
  //     // audioStream.destroy();
  //     speaker.close();

  //     if (audios[idx + 1]) {
  //       console.log('If: play next...');
  //       console.log({
  //         'audios': audios,
  //         'idx': idx
  //       });
  //       idx++;
  //       console.log(idx);
  //       // playFiles(audios, idx);
  //     } else {
  //       console.log('Else: play next...');
  //       console.log({
  //         'audios': audios,
  //         'idx': idx
  //       });
  //       console.log('finished playing', audios[idx]);
  //       // vosk.resumeMicRecognizer();
  //       notifier.emit('audio-finished-playing');
  //       // return;
  //     }
  //   });

  // var audio_duration = audio_files[audios[idx]];
  // setTimeout(() => {
  //   console.log('audio finished playing...');
  //   //speaker.end();
  //   idx += 1;
  //   if (audios[idx]) {
  //     console.log('play next...');
  //     //audioStream.destroy();
  //     //setTimeout(() => {

  //     //speaker.destroy();  
  //     playFiles(audios, idx);
  //     //},100);

  //   }
  //   else {
  //     //audioStream.destroy();
  //     audio_is_playing = false;
  //     console.log('audio-1');
  //     notifier.emit('audio-finished-playing');
  //   }
  // }, audio_duration);
}

function audioIsPlaying() {
  // console.log('====================================');
  // console.log('audioIsPlaying: ', audio_is_playing);
  // console.log('====================================');
  return audio_is_playing;
}

module.exports = {
  playFiles: playFiles,
  audioIsPlaying: audioIsPlaying,
  //playAudioPromise: playAudioPromise
}

