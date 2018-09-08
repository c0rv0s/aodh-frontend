import React, { Component } from 'react'
import {
  getFile
} from 'blockstack'

export default class Player extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      isLoading: false,
      file: null
    }
  }
  componentDidMount() {
    this.fetchData()
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

  playAudio() {
    document.getElementById("myAudio").play();
  }

  pauseAudio() {
    document.getElementById("myAudio").pause();
  }

  getType() {
    return 'audio/' + this.props.audio.audio.substring(this.props.audio.audio.length-3, this.props.audio.audio.length)
  }

  render() {
    if (this.state.isLoading) {
      return null
    }
    else {
      return (
        <span>

          <audio id="myAudio" controls>
            <source src={this.state.file} type={this.getType()} />
            Your browser does not support the audio element.
          </audio>
        </span>
      )
    }
  }


}
