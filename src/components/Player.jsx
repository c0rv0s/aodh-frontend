import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import {
  getFile,
  putFile
} from 'blockstack'

import {
  aud_pausePlaying,
  aud_addtoqueue,
  aud_removefromqueue,
  aud_loadfile,
  song_ended,
  aud_queuereplace,
  get_paused
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
    this.fetchData = this.fetchData.bind(this)
  }

  fetchData() {
    const options = {username: this.props.audio.op, decrypt: false}
    if (this.state.file == null) {
      this.setState({ isLoading: true })
        getFile(this.props.audio.audio, options)
          .then((file) => {
            aud_queuereplace(0, file, this.props.audio)
            this.setState({file: file})
            aud_loadfile(file,this.props.audio.created_at).then(
              () => {this.setState({ playing: false})}
            )
          })
          .catch((error) => {
            console.log(error);
            console.log('could not fetch audio')
          })
          .finally(() => {
            this.setState({ isLoading: false,
                            playing: true})
          })
    }
    else {
      aud_queuereplace(0, this.state.file, this.props.audio)
      aud_loadfile(this.state.file,this.props.audio.created_at).then(() => {this.setState({ playing: false})})
      this.setState({ isLoading: false,
                      playing: true})
    }
  }

  play_pause() {
    if (!this.state.playing) {
      if (get_paused() != this.props.audio.created_at)
        song_ended()
      this.fetchData()
    }
    else {
      this.setState({playing: false})
      aud_pausePlaying(this.props.audio.created_at)
    }
  }

  play_next() {
    if (this.state.file == null) {
      const options = { username: this.props.audio.op, decrypt: false}
      getFile(this.props.audio.audio, options)
        .then((file) => {
          aud_addtoqueue(file, this.props.audio).then(() => {
            this.setState({ playing: true})
            aud_loadfile(this.state.file,this.props.audio.created_at).then(() => {this.setState({ playing: false})})
          })
          this.setState({file: file})
        })
        .catch((error) => {
          console.log('could not fetch audio')
        })
    }
    else {
      aud_addtoqueue(this.state.file, this.props.audio).then(() => {
        this.setState({ playing: true})
        aud_loadfile(this.state.file,this.props.audio.created_at).then(() => {this.setState({ playing: false})})
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

  download() {
    const options = {username: this.props.audio.op, decrypt: false}
    var element = document.createElement('a');
    element.style.display = 'none';
    document.body.appendChild(element);

    if (this.state.file == null) {
      this.setState({ isLoading: true })
      getFile(this.props.audio.audio, options)
        .then((file) => {
          element.setAttribute('href', file);
          element.setAttribute('download', this.props.audio.title);
          element.click();
          document.body.removeChild(element);
          this.setState({file: file})
        })
        .catch((error) => {
          console.log('could not complete download')
        })
        .finally(() => {
          this.setState({ isLoading: false})
        })
    }
    else {
      element.setAttribute('href', this.state.file);
      element.setAttribute('download', this.props.audio.title);
      element.click();
      document.body.removeChild(element);
    }

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
            {this.props.audio.private &&
              <i className="fas fa-lock">{'\u00A0'}</i>
            }
            <Link to={'/'+this.props.audio.op+'/'+this.props.audio.title} className="blackText">
              {this.props.audio.title}
            </Link>

          </span>
          {this.state.isLoading &&
              <span className="myAudio">
                <div className="lds-ellipsis"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>
              </span>
          }
          {!this.state.isLoading &&
            <span className="myAudio">

              <span onClick={() => this.play_pause()}className="pointer">
                {this.state.playing ?  <i className="fas fa-pause-circle fa-2x"></i>
                :<i className="fas fa-play-circle fa-2x"></i>}
              </span>
              {'\u00A0'}{'\u00A0'}{'\u00A0'}{'\u00A0'}
              <span onClick={() => this.play_next()} className="pointer">
                <i className="fas fa-angle-double-up fa-2x"></i>
              </span>
              {'\u00A0'}{'\u00A0'}

              <div className="dropdown pointer" >
                <i className="fas fa-ellipsis-v fa-2x"></i>
                  <div className="dropdown-content">
                    <a  onClick={() => this.props.addToPlaylist(this.props.id)}>Add to Playlist</a>
                    {this.props.removeFromPlaylist &&
                      <a  onClick={() => this.props.removeFromPlaylist(this.props.id)}>Remove</a>
                    }
                    {this.props.local &&
                      <a  onClick={() => this.delete()}>Delete</a>
                    }
                    {this.props.audio.downloadable &&
                      <a onClick={() => this.download()}>Download</a>
                    }
                  </div>
              </div>


            </span>
          }
        </span>
      )
    }


}
