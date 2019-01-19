import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import {
  getFile,
  putFile,
  loadUserData
} from 'blockstack'

import {
  aud_pausePlaying,
  aud_addtoqueue,
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
            aud_loadfile(file,this.props.audio.created_at)
          })
          .catch((error) => {
            console.log(error);
            console.log('could not fetch audio')
          })
          .finally(() => {
            this.setState({ isLoading: false})
          })
    }
    else {
      aud_queuereplace(0, this.state.file, this.props.audio)
      aud_loadfile(this.state.file,this.props.audio.created_at)
      this.setState({ isLoading: false})
    }
  }

  play_pause() {
    if (this.props.now.status != 2) {
      if (get_paused() != this.props.audio.created_at)
        song_ended()
      this.fetchData()
    }
    else {
      if (this.props.audio.created_at == this.props.now.metadata.created_at) {
        aud_pausePlaying(this.props.audio.created_at)
      }
      else {
        if (get_paused() != this.props.audio.created_at)
          song_ended()
        this.fetchData()
      }
    }
  }

  play_next() {
    if (this.state.file == null) {
      const options = { username: this.props.audio.op, decrypt: false}
      getFile(this.props.audio.audio, options)
        .then((file) => {
          aud_addtoqueue(file, this.props.audio)
          this.setState({file: file})
        })
        .catch((error) => {
          console.log('could not fetch audio')
        })
    }
    else {
      aud_addtoqueue(this.state.file, this.props.audio)
    }
  }

  delete() {
    this.props.handleDelete(this.props.id)

    if (!this.props.audio.private){
      let username = loadUserData().username
      var data = {val: -1, username: username}
      var request = new Request('https://aodh.xyz/api/change_posts', {
        method: 'POST',
        headers: new Headers({'Content-Type': 'application/json'}),
        body: JSON.stringify(data)
      })
      fetch(request)
      .then((response) => {
        // console.log(response);
      })
      .catch((err) => {
        console.log(err);
      })
    }


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
                {(this.props.now.status == 2
                  && this.props.now.metadata.created_at == this.props.audio.created_at
                  && this.props.now.metadata.audio == this.props.audio.audio) ?
                  <i className="fas fa-pause-circle fa-2x"></i>
                 :<i className="fas fa-play-circle fa-2x"></i>}
              </span>
              {'\u00A0'}{'\u00A0'}{'\u00A0'}{'\u00A0'}
              <span onClick={() => this.play_next()} className="pointer" title="Add to Next Up">
                <i className="fas fa-angle-double-up fa-2x"></i>
              </span>
              {'\u00A0'}{'\u00A0'}

              <div className="dropdown pointer solar-player" >
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
