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
      audio: null,
      current_time: "--:--",
      duration: "--:--"
    }
  }

  componentDidMount() {
    var that = this
    setInterval(function(){
      var elem = document.getElementById("scrubbar");
      var width = 0
      var audio = aud_nowPlaying()
      if (audio.status === 2) {
        if (audio.duration > 0) {
          width = 100 * audio.time / audio.duration
          if (width > 100) width = 0
        }
        elem.style.width = width + '%';
        var d_minutes = Math.floor(audio.duration/60)
        var d_seconds = Math.floor(audio.duration%60)
        var c_minutes = Math.floor(audio.time/60)
        var c_seconds = Math.floor(audio.time%60)

        if (d_seconds < 10) d_seconds = '0'.concat(d_seconds)
        if (c_seconds < 10) c_seconds = '0'.concat(c_seconds)

        that.setState({
          playing: true,
          audio:audio.metadata,
          duration: d_minutes + ":" + d_seconds,
          current_time: c_minutes + ":" + c_seconds
        })
      }
      else if (audio.status === 1) {
        that.setState({
          playing: false,
          audio:audio.metadata,
        })
      }
      else {
        elem.style.width = width + '%';
        that.setState({
          playing: false,
          audio: null,
          current_time: "--:--",
          duration: "--:--"
        })
      }
    }, 50);
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
      return <div className="marginright inline" >
                Not Playing
             </div>
    }
    else {
      return (
        <div className="marginright inline" >
          {this.state.audio.title + " by\u00A0"}
          <Link to={this.state.audio.op}>{this.state.audio.op.split('.')[0]}</Link>
        </div>
      )
    }
  }

  button() {
    if (this.state.playing) {
      return (
        <div className="marginleft inline" >
          <i className="fas fa-pause-circle fa-2x pointer"
          onClick={() => this.play_pause()} ></i>
        </div>
      )
    }
    else if (!this.state.playing && this.state.audio != null) {
      return (
        <div className="marginleft inline" >
            <i className="fas fa-play-circle fa-2x pointer"
            onClick={() => this.play_pause()} ></i>
        </div>
      )
    }
    else if (!this.state.playing && this.state.audio == null) {
      return (
        <div className="marginleft inline" >
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

        <span className="left" id="scrub-container">
          <div id="time-markers" className="inline">
            {'\u00A0'}{'\u00A0'}{'\u00A0'}{'\u00A0'}{'\u00A0'}{'\u00A0'}
            {'\u00A0'}{'\u00A0'}{this.state.current_time}{'\u00A0'}{'\u00A0'}
          </div>
          <div id="scrub">
            <div id="scrubbar"></div>
          </div>
          <div id="time-markers" className="inline">
              {'\u00A0'}{'\u00A0'}{this.state.duration}
          </div>
        </span>

        <span className="right">
          {this.title()}
        </span>

      </div>
    )
  }
}
