import React, { Component } from 'react'
import {
  getFile,
  putFile
} from 'blockstack'
import play from '../images/play.png'
import pause from '../images/pause.png'
import next from '../images/next.png'
import more from '../images/more.png'

import {
  aud_pausePlaying,
  aud_addtoqueue,
  aud_removefromqueue,
  aud_loadfile,
  song_ended,
  aud_queuereplace
} from '../assets/audio_engine.js'

export default class Player extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      isLoading: false,
      file: null,
      playing: false,
      saved: this.props.saved
    }
  }

  fetchData() {
    if (this.state.file == null) {
      this.setState({ isLoading: true })
      getFile(this.props.audio.audio)
        .then((file) => {
          aud_queuereplace(0, file)
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
    else {
      aud_queuereplace(0, this.state.file)
      aud_loadfile(this.state.file).then(() => {this.setState({ playing: false})})
      this.setState({ isLoading: false,
                      playing: true})
    }
  }

  play_pause() {
    if (!this.state.playing) {
      song_ended()
      this.fetchData()
    }
    else {
      this.setState({playing: false})
      aud_pausePlaying()
    }
  }

  play_next() {
    if (this.state.file == null) {
      getFile(this.props.audio.audio)
        .then((file) => {
          aud_addtoqueue(file).then(() => {
            this.setState({ playing: true})
            aud_loadfile(this.state.file).then(() => {this.setState({ playing: false})})
          })
          this.setState({file: file})
        })
        .catch((error) => {
          console.log('could not fetch audio')
        })
    }
    else {
      aud_addtoqueue(this.state.file).then(() => {
        this.setState({ playing: true})
        aud_loadfile(this.state.file).then(() => {this.setState({ playing: false})})
      })
    }
  }

  delete() {
    this.props.handleDelete(this.props.id)
    putFile(this.props.audio.audio, JSON.stringify(""))
    .then(() => {
      console.log('replaced with empty file');
    })
  }

  save() {
    this.props.handleSave(this.props.id)
    if (!this.props.always)
      this.setState({saved: !this.state.saved})
  }

  render() {
      return (
        <span>
          <span>
            <input type='button'
                   className="save-button"
                   onClick={() => this.save()}
                   value={this.state.saved? "\u2713" : "+"}/>
            {'\u00A0'}{'\u00A0'}{'\u00A0'}{'\u00A0'}
            {this.props.audio.title}
          </span>
          {this.state.isLoading &&
              <span className="myAudio">
                <div className="lds-ellipsis"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>
              </span>
          }
          {!this.state.isLoading &&
            <span className="myAudio">

              <img src={this.state.playing ? pause:play}
                   alt="play/pause"
                   className="controls"
                   onClick={() => this.play_pause()}/>
              <img src={next}
                  alt="play next"
                  title="Add to queue"
                  className="controls"
                  onClick={() => this.play_next()}/>
                {this.props.local &&
                  <div className="dropdown">
                    <img src={more}
                        alt="more options"
                        className="controls dropbtn"/>
                      <div className="dropdown-content">
                      <a  onClick={() => this.delete()}>Delete</a>
                    </div>
                  </div>
                }
            </span>
          }
        </span>
      )
    }


}
