import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import {
  aud_nowPlaying,
  aud_pausePlaying,
  aud_removefromqueue,
  aud_loadfile,
  song_ended,
  aud_queuereplace,
  aud_resumePlaying,
  get_paused
} from '../assets/audio_engine.js'

export default class Footer extends Component {
  constructor(props) {
  	super(props)
    this.state = {
      playing: false,
      isLoading: false,
      audio: null
    }
  }

  componentDidMount() {
    var that = this
    setInterval(function(){
      var audio = aud_nowPlaying()
      if (audio.status === 2) {
        that.setState({
          playing: true,
          audio:audio.metadata,
        })
      }
      else if (audio.status === 1) {
        that.setState({
          playing: false,
          audio:audio.metadata,
        })
      }
      else {
        that.setState({
          playing: false,
          audio: null,
        })
      }
    }, 100);
  }

  play_pause() {
    var audio = aud_nowPlaying()
    if (audio.status === 2) {
      aud_pausePlaying(audio.metadata.created_at)
      this.setState({playing: false})
    }
    else if (audio.status === 1){
      aud_resumePlaying()
      this.setState({playing: true})
    }

  }

  title() {
    if (this.state.audio == null) {
      return <div className="marginright">
                Not Playing
             </div>
    }
    else {
      return (
        <div className="marginright">
          {this.state.audio.title + " by\u00A0"}
          <Link to={this.state.audio.op}>{this.state.audio.op.split('.')[0]}</Link>
        </div>
      )
    }
  }

  button() {
    if (this.state.playing) {
      return (
        <div className="marginleft">
          <i className="fas fa-pause-circle fa-2x pointer"
          onClick={() => this.play_pause()} ></i>
        </div>
      )
    }
    else if (!this.state.playing && this.state.audio != null) {
      return (
        <div className="marginleft">
            <i className="fas fa-play-circle fa-2x pointer"
            onClick={() => this.play_pause()} ></i>
            </div>
      )
    }
    else if (!this.state.playing && this.state.audio == null) {
      return (
        <div className="marginleft">
          <i className="fas fa-play-circle fa-2x" style={{color:"grey"}}></i>
          </div>
      )
    }
  }

  render() {
    return (
      <div className="footer">
        <span className="left">
          {this.button()}
        </span>

        <span className="right">
          {this.title()}
        </span>
      </div>
    )
  }
}
