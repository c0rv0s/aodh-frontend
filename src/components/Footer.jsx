import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import QueueItem from './QueueItem.jsx'
import {
  aud_nowPlaying,
  aud_pausePlaying,
  aud_removefromqueue,
  aud_loadfile,
  song_ended,
  aud_queuereplace,
  aud_resumePlaying,
  get_paused,
  next_song,
  set_playfrom,
  get_queue
} from '../assets/audio_engine.js'

export default class Footer extends Component {
  constructor(props) {
  	super(props)
    this.state = {
      playing: false,
      isLoading: false,
      audio: null,
      current_time: "--:--",
      duration: "--:--",
      show: false,
      queue: []
    }
    this.show_queue = this.show_queue.bind(this)
  }

  componentDidMount() {
    var that = this
    var elem = document.getElementById("scrubbar");
    setInterval(function(){
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
          playing: false,
          audio:audio.metadata,
          duration: d_minutes + ":" + d_seconds,
          current_time: c_minutes + ":" + c_seconds
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

    document.getElementById('scrub').addEventListener('click', function (e) {
      if (that.state.audio != null) {
        var x = e.pageX - this.offsetLeft - 100, // or e.offsetX (less support, though)
        y = e.pageY - this.offsetTop,  // or e.offsetY
        scrub_width = this.offsetWidth;

        var width = x/scrub_width
        elem.style.width = (100*width) + '%';

        set_playfrom(width)
      }
    });
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

  fast_forward() {
    next_song()
  }

  title() {
    if (this.state.audio == null) {
      return <div className="marginright inline" >
                Not Playing
             </div>
    }
    else {
      const aud = this.state.audio
      return (
        <div className="marginright inline" >
            <Link to={'/'+aud.op+'/'+aud.title} className="blackText">
              {aud.title + ' by ' +aud.op.split('.')[0]}
            </Link>
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
        {'\u00A0'}{'\u00A0'}{'\u00A0'}{'\u00A0'}
          <i className="fas fa-fast-forward fa-2x pointer"
          onClick={() => this.fast_forward()} ></i>
        </div>
      )
    }
    else if (!this.state.playing && this.state.audio != null) {
      return (
        <div className="marginleft inline" >
            <i className="fas fa-play-circle fa-2x pointer"
            onClick={() => this.play_pause()} ></i>
          {'\u00A0'}{'\u00A0'}{'\u00A0'}{'\u00A0'}
            <i className="fas fa-fast-forward fa-2x pointer"
            onClick={() => this.fast_forward()} ></i>
        </div>
      )
    }
    else if (!this.state.playing && this.state.audio == null) {
      return (
        <div className="marginleft inline" >
          <i className="fas fa-play-circle fa-2x" style={{color:"grey"}}></i>
          {'\u00A0'}{'\u00A0'}{'\u00A0'}{'\u00A0'}
          <i className="fas fa-fast-forward fa-2x" style={{color:"grey"}}></i>
        </div>
      )
    }
  }

  show_queue() {
    var queue = get_queue()
    this.setState({
      show: !this.state.show,
      queue: queue
    })
  }

  remove(i) {
    aud_removefromqueue(i)
  }
  play(i) {
    while (i > 0) {
      next_song()
      i--
    }
  }

  render() {
    return (
      <div>

        <ul className="queue" title="Now Playing Queue"
          style={{display: this.state.show?"block":"none"}}>
            {
              this.state.queue.map((item, i) => (
                <div key={i} >
                  <QueueItem  item={item} id={i}
                              remove={this.remove}
                              play={this.play}/>
                </div>
                )
              )
            }
        </ul>

      <div className="footer">

        <span className="left">
          {this.button()}
        </span>

        <span className="left" id="scrub-container">
          <div id="time-markers" className="inline">
            {'\u00A0'}{'\u00A0'}{'\u00A0'}{'\u00A0'}{'\u00A0'}{'\u00A0'}
            {'\u00A0'}{'\u00A0'}{this.state.current_time}{'\u00A0'}{'\u00A0'}
          </div>
          <div id="scrub" className="pointer">
            <div id="scrubbar"></div>
          </div>
          <div id="time-markers" className="inline">
              {'\u00A0'}{'\u00A0'}{this.state.duration}
          </div>
          <div className="inline" >
            {'\u00A0'}{'\u00A0'}{'\u00A0'}{'\u00A0'}{'\u00A0'}{'\u00A0'}{'\u00A0'}{'\u00A0'}
            <i className="fas fa-list fa-2x pointer"
              onClick={() => this.show_queue()}>
            </i>
          </div>
        </span>


        <span className="right">
          {this.title()}
        </span>

      </div>
      </div>
    )
  }
}
