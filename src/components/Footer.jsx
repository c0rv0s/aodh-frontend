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
  get_queue,
  cut_queue
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

  componentWillReceiveProps(nextProps) {
    var elem = document.getElementById("scrubbar");
    if (nextProps.now) {
      var width = 0
      var audio = nextProps.now
      if (audio.status === 2 || audio.status === 1) {
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

        this.setState({
          playing: audio.status == 2 ? true : false,
          audio:audio.metadata,
          duration: d_minutes + ":" + d_seconds,
          current_time: c_minutes + ":" + c_seconds
        })
      }
      else {
        elem.style.width = width + '%';
        this.setState({
          playing: false,
          audio: null,
          current_time: "--:--",
          duration: "--:--"
        })
      }
    }
  }

  componentDidMount() {
    var that = this
    document.getElementById('scrub').addEventListener('click', function (e) {
      if (that.state.audio != null) {
        var x = e.pageX - this.offsetLeft - 100, // or e.offsetX (less support, though)
        y = e.pageY - this.offsetTop,  // or e.offsetY
        scrub_width = this.offsetWidth;

        var width = x/scrub_width
        document.getElementById("scrubbar").style.width = (100*width) + '%';

        set_playfrom(width)
      }
    });
  }

  play_pause() {
    var audio = this.props.now
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
      let aud = this.state.audio
      return (
        <div className="marginright inline" >
          <div>
            <Link to={'/'+aud.op} className="blackText solarbrown">{aud.op.split('.')[0]}</Link>
          </div>

          <div>{'\u00A0'}by{'\u00A0'}</div>

          <div>
            <Link to={'/'+aud.op+'/'+aud.title} >
              {aud.title}
            </Link>
          </div>


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
    cut_queue(i)
  }
  clear() {
    var i = this.state.queue.length
    while (i > 0) {
      this.remove(i)
      i--
    }
  }

  render() {
    return (
      <div>

        <div className="queue-box" title="Now Playing Queue"
          style={{display: this.state.show?"block":"none"}}>
          <div className="left-align queue-title">
            {'\u00A0'}{'\u00A0'}{'\u00A0'}{'\u00A0'}
            <b>Now Playing</b>
            <span className="queue-control pointer" onClick={() => this.show_queue()}>Close</span>
            <span className="queue-control pointer" onClick={() => this.clear()}>Clear</span>

          </div>
          <div className="queue">
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
          </div>
        </div>

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
