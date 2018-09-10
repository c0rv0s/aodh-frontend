import React, { Component } from 'react'
import {
  getFile
} from 'blockstack'
import play from '../images/play.png'
import pause from '../images/pause.png'

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
    if (this.props.local) {
      this.setState({ isLoading: true })

      getFile(this.props.audio.audio)
        .then((file) => {
          this.setState({file: file})
        })
        .catch((error) => {
          console.log('could not fetch audio')
        })
        .finally(() => {
          this.setState({ isLoading: false })
        })
    } else {
      this.setState({ isLoading: true })

      getFile(this.props.audio.audio)
        .then((file) => {
          this.setState({file: file})
        })
        .catch((error) => {
          console.log('could not fetch audio')
        })
        .finally(() => {
          this.setState({ isLoading: false })
        })
    }
  }

  play_pause() {
    this.setState({playing: !this.state.playing})
  }

  render() {
    if (this.state.isLoading) {
      return null
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
