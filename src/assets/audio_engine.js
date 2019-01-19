// audio engine, playing and management goes in here
// export functions that need to be accessed outside this file
//
// Audio context

var queue = []
var meta_queue = []
var audioContext
var source
var suspended = false
var playfrom = 0
var aud_playing = false
var paused = ""
var song_length = 0

var play_start = 0
var extra_time = 0


export function song_ended() {
  playfrom = 0
}
export function get_paused() {
  return paused
}

export function get_queue() {
  return meta_queue
}

export function set_playfrom(num) {
  playfrom = num * song_length
  if (aud_playing) {
    source.stop();
    source.disconnect()
    audioContext.resume()
    suspended = false
    aud_loadfile(queue[0])
  }
}

export function next_song() {
  if (meta_queue.length > 1) {
    source.stop();
    source.disconnect()
    audioContext.resume()
    suspended = false
    aud_over()
  }

}

export function aud_nowPlaying() {
  if (aud_playing){ //playing
    return {
      status: 2,
      metadata: meta_queue[0],
      time: audioContext.currentTime - play_start + playfrom,
      duration: song_length
    }
  }
  else if (!aud_playing && meta_queue.length > 0) { //something is paused
    return {
      status: 1,
      metadata: meta_queue[0],
      time: playfrom,
      duration: song_length
    }
  }
  else {        //empty queue
    return {
      status: 0,
      metadata: {created_at: null}
    }
  }
}

//when you hit the little play on a song down the queue
export function cut_queue(i) {
  if (suspended) {
    source.stop();
    source.disconnect()
  }

  while (i > 0) {
    queue.shift()
    meta_queue.shift()
    i--
  }
  if (suspended) {
    audioContext.resume()
    suspended = false
    aud_over()
  }

  else {
    aud_loadfile(queue[0],meta_queue[0].created_at)
  }
}

export function aud_over() {
    playfrom = 0
    aud_playing = false
    song_ended()
    queue.shift()
    meta_queue.shift()
    aud_loadfile(queue[0],meta_queue[0].created_at)
}

export function aud_pausePlaying(current) {
  audioContext.suspend()
  suspended = true
  aud_playing = false
  paused = current
  playfrom = audioContext.currentTime - play_start + playfrom
}

export function aud_resumePlaying() {
  if (playfrom != 0) {
    source.stop();
    source.disconnect()
    audioContext.resume()
    suspended = false
    aud_loadfile(queue[0])
  }
  if (suspended) {
    audioContext.resume()
    suspended = false
    aud_playing = true
    paused = ""
    play_start = audioContext.currentTime
  }
  else {
    aud_loadfile(queue[0],meta_queue[0].created_at)
  }
}

export function aud_addtoqueue(file, metadata) {
  queue.push(file)
  meta_queue.push(metadata)
}

// probably rewrite this to take meta as arg
export function aud_removefromqueue(index) {
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
  if (aud_playing || (suspended && current != paused)) {
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
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
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
        song_length = buffer.duration
        // Connect the audio to source (multiple audio buffers can be connected!)
        source.connect(audioContext.destination);
        // Play the sound!
        source.start(0, playfrom);
        play_start = audioContext.currentTime
      }, function(e) {
        console.log('Audio error! ', e);
        source.stop();
        source.disconnect()
        audioContext.resume()
      });
    }
    // Send the request which kicks off
    request.send();
    aud_playing = true
  }
  source.onended = function(event) {
    event.preventDefault()
    aud_over()
  }

}
