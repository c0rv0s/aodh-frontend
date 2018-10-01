import React, { Component } from 'react'
import {
  getFile
} from 'blockstack'
import play from '../images/play.png'
import pause from '../images/pause.png'
import loading from '../images/loader.gif'

import {
  aud_stopPlaying,
  aud_pausePlaying,
  aud_addtoqueue,
  aud_removefromqueue,
  aud_loadfile
} from '../assets/audio_engine.js'

export default class Player extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      isLoading: false,
      file: null,
      playing: false
    }
  }

  fetchData() {
    if (this.state.file == null) {
      if (this.props.local) {
        this.setState({ isLoading: true })
        getFile(this.props.audio.audio)
          .then((file) => {
            this.setState({file: file})
            aud_loadfile(file).then(() => {this.setState({ playing: false})})
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
            aud_loadfile(file).then(() => {this.setState({ playing: false})})
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
      aud_loadfile(this.state.file).then(() => {this.setState({ playing: false})})
      this.setState({ isLoading: false,
                      playing: true})
    }
  }

  play_pause() {
    if (!this.state.playing) {
      this.fetchData()
    }
    else {
      this.setState({playing: false})
      aud_pausePlaying()
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
