// audio engine, playing and management goes in here
// export functions that need to be accessed outside this file
//
// Audio context

var queue = []
var audioContext = new (window.AudioContext || window.webkitAudioContext)();
var source = audioContext.createBufferSource();
var suspended = false
var playfrom = 0
var ended = 0

export function aud_stopPlaying() {
    source.disconnect();
    source.stop();
    playfrom = 0
    ended += 1
    console.log('done');
}

export function aud_pausePlaying() {
  suspended = true
  audioContext.suspend()
}

export function aud_addtoqueue(file) {
  queue.append(file)
}

export function aud_removefromqueue(file) {
  var index = array.indexOf(file);
  if (index > -1) {
    array.splice(index, 1);
  }
}

export function aud_loadfile(file) {
  console.log('load');
  if (suspended) {
    audioContext.resume()
    suspended = false
  }
  else {
    source = audioContext.createBufferSource();
    // Create the XHR which will grab the audio contents
    var request = new XMLHttpRequest();

    // Set the audio file src here
    request.open('GET', file, true);
    // Setting the responseType to arraybuffer sets up the audio decoding
    request.responseType = 'arraybuffer';
    request.onload = function() {
      // Decode the audio once the require is complete
      audioContext.decodeAudioData(request.response, function(buffer) {
        source.buffer = buffer;
        // Connect the audio to source (multiple audio buffers can be connected!)
        source.connect(audioContext.destination);
        // Play the sound!
        source.start(0, playfrom);
      }, function(e) {
        console.log('Audio error! ', e);
      });
    }
    // Send the request which kicks off
    request.send();
  }

  source.onended = function(event) {
    event.preventDefault()
    aud_stopPlaying()
  }
  var o_ended = ended
  var promise = new Promise(function(resolve, reject) {
    setInterval(function(){
      if (ended == o_ended + 1) {
        resolve("Stuff worked!");
      }
      else if (ended != o_ended) {
        reject(Error("It broke"));
      }
    }, 250);
  });
  return promise
}
