// audio engine, playing and management goes in here
// export functions that need to be accessed outside this file
//
// Audio context

import {
  getFile,
  putFile,
  loadUserData
} from 'blockstack'

var queue = []
var meta_queue = []

var cache = []
var meta_cache = []

var audioContext
var source
var suspended = false
var playfrom = 0
var aud_playing = false
var paused = ""
var song_length = 0
var loading = false

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
      duration: song_length,
      loading: loading
    }
  }
  else if (!aud_playing && meta_queue.length > 0) { //something is paused
    return {
      status: 1,
      metadata: meta_queue[0],
      time: playfrom,
      duration: song_length,
      loading: loading
    }
  }
  else {        //empty queue
    return {
      status: 0,
      metadata: {created_at: null},
      loading: loading
    }
  }
}

function cache_song() {
  cache.push(queue[0])
  meta_cache.push(meta_queue[0])
  if (cache.length > 25) {
    cache.shift()
    meta_cache.shift()
  }
}

//when you hit the little play on a song down the queue
export function cut_queue(i) {
  if (suspended) {
    source.stop();
    source.disconnect()
  }

  while (i > 0) {
    cache_song()
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
    aud_playing = false
    song_ended()
    cache_song()
    queue.shift()
    meta_queue.shift()
    if (queue.length != meta_queue.length) {
      loading = true
      var o = setInterval(function(){
        if (queue.length == meta_queue.length) {
          clearInterval(o)
          loading = false
          aud_loadfile(queue[0],meta_queue[0].created_at)
        }
      }, 100);
    }
    else {
      aud_loadfile(queue[0],meta_queue[0].created_at)
    }
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
    aud_loadfile(queue[0],meta_queue[0].created_at)
  }
  else if (suspended) {
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

export function aud_addtoqueue(audio) {
  const options = {username: audio.op, decrypt: false}
  if (meta_queue.filter(a => a.created_at == audio.created_at).length > 0) {
    let index = 0
    meta_queue.forEach(function(e, i){
      if (e.created_at == audio.created_at) index = i
    })
    meta_queue.push(audio)
    queue.push(queue[index])
  }
  else if (meta_cache.filter(a => a.created_at == audio.created_at).length > 0) {
    let index = 0
    meta_cache.forEach(function(e, i){
      if (e.created_at == audio.created_at) index = i
    })
    meta_queue.push(audio)
    queue.push(cache[index])
  }
  else {
    meta_queue.push(audio)
    getFile(audio.audio, options)
      .then((file) => {
        queue.push(file)
      })
      .catch((error) => {
        console.log(error);
        console.log('could not fetch audio')
      })
  }
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

// downloads the file passed in and then calls aud_loadfile on it
export function aud_fetchData(audio) {
  const options = {username: audio.op, decrypt: false}
  var file_obtained = false
  var promise = new Promise(function(resolve, reject) {
    var l = setInterval(function(){
      if (file_obtained) {
        resolve('done')
        clearInterval(l)
      }
    }, 250);
  });
  if (meta_queue.filter(a => a.created_at == audio.created_at).length > 0) {
    let index = 0
    meta_queue.forEach(function(e, i){
      if (e.created_at == audio.created_at) index = i
    })
    aud_queuereplace(0, queue[index], audio)
    aud_loadfile(queue[index], audio.created_at)
    file_obtained = true
  }
  else if (meta_cache.filter(a => a.created_at == audio.created_at).length > 0) {
    let index = 0
    meta_cache.forEach(function(e, i){
      if (e.created_at == audio.created_at) index = i
    })
    aud_queuereplace(0, cache[index], audio)
    aud_loadfile(cache[index], audio.created_at)
    file_obtained = true
  }
  else {
    getFile(audio.audio, options)
      .then((file) => {
        aud_queuereplace(0, file, audio)
        aud_loadfile(file, audio.created_at)
        file_obtained = true
      })
      .catch((error) => {
        console.log(error);
        console.log('could not fetch audio')
        file_obtained = true
      })
  }
  return promise
}

// takes the file passed to it and starts playing
export function aud_loadfile(file, current) {
  if (aud_playing || (suspended && current != paused)) {
    // stop what's currently playing
    cache_song()
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
        // source.stop();
        // source.disconnect()
        // audioContext.resume()
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
