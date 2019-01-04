// audio engine, playing and management goes in here
// export functions that need to be accessed outside this file
//
// Audio context

var queue = []
var meta_queue = []
var audioContext = new (window.AudioContext || window.webkitAudioContext)();
var source = audioContext.createBufferSource();
var suspended = false
var playfrom = 0
var ended = 0
var playing = false
var paused = ""

export function song_ended() {
  ended += 1
}
export function get_paused() {
  return paused
}

export function aud_nowPlaying() {
  if (playing){
    return {
      status: 2,
      metadata: meta_queue[0]
    }
  }
  else if (!playing && meta_queue.length > 0) {
    return {
      status: 1,
      metadata: meta_queue[0]
    }
  }
  else {
    return {
      status: 0,
      metadata: {}
    }
  }
}

export function aud_over() {
    playfrom = 0
    playing = false
    song_ended()
    queue.shift()
    meta_queue.shift()
}

export function aud_pausePlaying(current) {
  suspended = true
  playing = false
  paused = current
  audioContext.suspend()
}

export function aud_resumePlaying() {
  audioContext.resume()
  suspended = false
  playing = true
  paused = ""
}

export function aud_addtoqueue(file, metadata) {
  queue.push(file)
  meta_queue.push(metadata)
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

// probably rewrite this to take meta as arg
export function aud_removefromqueue(file) {
  var index = queue.indexOf(file);
  if (index > -1) {
    queue.splice(index, 1);
    meta_queue.splice(index, 1);
  }
}

export function aud_queuereplace(index, file, metadata) {
  queue[index] = file
  meta_queue[index] = metadata
}

export function aud_loadfile(file, current) {
  if (playing || (suspended && current != paused)) {
    // stop what's currently playing
    source.stop();
    source.disconnect()
    audioContext.resume()
    suspended = false
  }
  if (suspended && current == paused) {
       aud_resumePlaying()
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
  }
    // do the promise stuff
    source.onended = function(event) {
      event.preventDefault()
      aud_over()
    }
    var o_ended = ended
    var promise = new Promise(function(resolve, reject) {
      setInterval(function(){
        if (ended == o_ended + 1) {
          resolve("song ended");
        }
        if (!playing) {
          resolve("paused from footer");
        }
        else if (ended > o_ended + 1) {
          reject(Error("It broke"));
        }
      }, 100);
    });
    return promise

}
