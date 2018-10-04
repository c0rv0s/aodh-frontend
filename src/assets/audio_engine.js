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
var playing = false

export function song_ended() {
  ended += 1
}

export function aud_over() {
    playfrom = 0
    playing = false
    song_ended()
    queue.shift()
}

export function aud_pausePlaying() {
  suspended = true
  playing = false
  audioContext.suspend()
}

export function aud_addtoqueue(file) {
  queue.push(file)
  // promise to change player to pause
  var o_start = ended+queue.length - 1
  var promise = new Promise(function(resolve, reject) {
    setInterval(function(){
      if (ended == o_start) {
        resolve("Stuff worked!");
      }
      else if (ended > o_start + 1) {
        reject(Error("It broke"));
      }
    }, 100);
  });
  return promise
}

export function aud_removefromqueue(file) {
  var index = array.indexOf(file);
  if (index > -1) {
    array.splice(index, 1);
  }
}

export function aud_queuereplace(index, file) {
  queue[index] = file
}

export function aud_loadfile(file) {
  if (playing) {
    // stop what's currently playing
    source.stop();
    source.disconnect()
  }
  if (suspended) {
    audioContext.resume()
    suspended = false
    playing = true
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
    playing = true

    // do the promise stuff
    source.onended = function(event) {
      event.preventDefault()
      aud_over()
    }
    var o_ended = ended
    var promise = new Promise(function(resolve, reject) {
      setInterval(function(){
        if (ended == o_ended + 1) {
          resolve("Stuff worked!");
        }
        else if (ended > o_ended + 1) {
          reject(Error("It broke"));
        }
      }, 100);
    });
    return promise
  }
}
