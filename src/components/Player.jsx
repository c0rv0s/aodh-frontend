import React, { Component } from 'react'
import {
  getFile
} from 'blockstack'
import play from '../images/play.png'
import pause from '../images/pause.png'
import loading from '../images/loader.gif'

import AudioEngine from '../assets/audio_engine.js'

export default class Player extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      isLoading: false,
      file: null,
      playing: false
    }
    this.audeng = new AudioEngine()
    var _this = this
    this.audeng.source.onended = function(event) {
      event.preventDefault()
      _this.onend()
    }
  }

  fetchData() {
    if (this.state.file == null) {
      if (this.props.local) {
        this.setState({ isLoading: true })
        getFile(this.props.audio.audio)
          .then((file) => {
            this.setState({file: file})
            this.audeng.loadfile(file)

          })
          .catch((error) => {
            console.log('could not fetch audio')
          })
          .finally(() => {
            this.setState({ isLoading: false,
                            playing: true})
          })
      } else {
        this.setState({ isLoading: true })
        getFile(this.props.audio.audio)
          .then((file) => {
            this.setState({file: file})
            this.audeng.loadfile(file)
          })
          .catch((error) => {
            console.log('could not fetch audio')
          })
          .finally(() => {
            this.setState({ isLoading: false,
                            playing: true})

          })
      }
    }
    else {
      this.audeng.loadfile(this.state.file)
      this.setState({ isLoading: false,
                      playing: true})
      var _this = this
      this.audeng.source.onended = function(event) {
        event.preventDefault()
        _this.onend()
      }

    }
  }

  onend() {
    this.setState({ playing: false})
    this.audeng.stopPlaying()
  }

  play_pause() {
    if (!this.state.playing) {
      this.fetchData()

    }
    else {
      this.setState({playing: false})
      this.audeng.pausePlaying()
    }
  }

  render() {
    if (this.state.isLoading) {
      return (
        <span className="myAudio">
          <img src={loading}
               alt="loading..."
               height="64" width="64" />
           </span>
      )
    }
    else {
      return (
        <span className="myAudio">
          <img src={this.state.playing ? pause:play}
               alt="play/pause"
               onClick={() => this.play_pause()}/>
        </span>
      )
    }
  }


}
