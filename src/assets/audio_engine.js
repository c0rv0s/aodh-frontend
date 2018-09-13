// audio engine, playing and management goes in here
// export functions that need to be accessed outside this file
//
// Audio context

export default class AudioEngine {

  constructor() {
    this.queue = []
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    this.source = this.audioContext.createBufferSource();
    this.suspended = false
  }

  stopPlaying() {
      this.source.disconnect();
      this.source.stop();
      this.playfrom = 0
      this.source = this.audioContext.createBufferSource();
  }

  pausePlaying() {
    this.suspended = true
    this.audioContext.suspend()
  }

  loadfile(file) {
    if (this.suspended) {
      this.audioContext.resume()
      this.suspended = false
    }
    else {
      // Create the XHR which will grab the audio contents
      var request = new XMLHttpRequest();
      var _this = this

      // Set the audio file src here
      request.open('GET', file, true);
      // Setting the responseType to arraybuffer sets up the audio decoding
      request.responseType = 'arraybuffer';
      request.onload = function() {
        // Decode the audio once the require is complete
        _this.audioContext.decodeAudioData(request.response, function(buffer) {
          _this.source.buffer = buffer;
          // Connect the audio to source (multiple audio buffers can be connected!)
          _this.source.connect(_this.audioContext.destination);
          // Play the sound!
          _this.source.start(0, _this.playfrom);
        }, function(e) {
          console.log('Audio error! ', e);
        });
      }
      // Send the request which kicks off
      request.send();
    }
  }

}
