const Speaker = require('speaker');
var fs = require('fs');
var notifier = require('./notifier');
var audio_is_playing = false;
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

function playFiles(audios, idx) {
  if (!audios[idx]) return;

  var audioStream = fs.createReadStream(audios[idx], { highWaterMark: 10000 });
  var speaker = new Speaker({
    channels: 2,          // 2 channels
    bitDepth: 16,         // 16-bit samples
    sampleRate: 22031.25, // 22031.25 Hz sample rate
    device: 'hw:2,0'
    //device: 'hw:5,0'
  });

  audioStream.on('error', function (err) {
    res.end(err);
  });

  audioStream.on('open', function () {
    // var audio_duration = audio_files[audios[idx]];
    notifier.emit('audio-started-playing');
    audio_is_playing = true;

    audioStream.pipe(speaker)
      .on('data', (chunk) => {
        for (const writable of writables) {
          writable.write(chunk);
        }
      })
      .on('close', function () {
        notifier.emit('audio-finished-playing');
        console.log('finished playing', audios[idx]);

        audio_is_playing = false;
        // audioStream.destroy();
        // speaker.close();

        if (audios[idx + 1]) {
          console.log('If: play next...');
          console.log({
            'audios': audios,
            'idx': idx
          });
          idx++;
          playFiles(audios, idx);
        } else {
          console.log('Else: play next...');
          console.log({
            'audios': audios,
            'idx': idx
          });
          return;
        }
      });
  })

  // setTimeout(() => {
  //   console.log('audio finished playing...');
  //   //speaker.end();
  //   idx += 1;
  //   if (audios[idx]) {
  //     console.log('play next...');
  //     //audioStream.destroy();
  //     //setTimeout(() => {

  //     //speaker.destroy();  
  //     return playFiles(audios, idx);
  //     //},100);

  //   }
  //   else {
  //     //audioStream.destroy();
  //     audio_is_playing = false;
  //     console.log('audio-1');
  //     notifier.emit('audio-finished-playing');
  //   }
  // }, duration);
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

