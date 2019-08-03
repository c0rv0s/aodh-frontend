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
  get_paused,
  aud_fetchData
} from '../assets/audio_engine.js'

export default class Player extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      isLoading: false,
      saved: this.props.saved
    }
  }

  play_pause() {
    const now = this.props.now
    // not playing
    if (now.status != 2) {
      this.setState({isLoading: true})
      // if (get_paused() != this.props.audio.created_at){
      //   song_ended()
      // }
      aud_fetchData(this.props.audio).then(() => {
        this.setState({isLoading: false})
      })
    }
    // playing
    else {
      // playing this player's song
      if (this.props.audio.created_at == now.metadata.created_at) {
        aud_pausePlaying(this.props.audio.created_at)
      }
      // playing someting else
      else {
        // if (get_paused() != this.props.audio.created_at){
        //   song_ended()
        // }

        this.setState({isLoading: true})
        aud_fetchData(this.props.audio).then(() => {
          this.setState({isLoading: false})
        })
      }
    }
  }

  play_next() {
    aud_addtoqueue(this.props.audio)
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

    this.setState({ isLoading: true })
    getFile(this.props.audio.audio, options)
      .then((file) => {
        let element = document.createElement('a');
        let title = this.props.audio.title
        if(navigator.userAgent.indexOf("Firefox") != -1 )
        {
         title += '.wav'
        }
        if(navigator.userAgent.indexOf("Chrome") != -1 )
        {
         alert('This feature is only partially supported by this browser. If the download is unsuccessful please try another browser.')
        }
        element.style.display = 'none';
        document.body.appendChild(element);
        element.setAttribute('href', file);
        element.setAttribute('download', title);
        element.click();
        document.body.removeChild(element);
      })
      .catch((error) => {
        console.log('could not complete download')
      })
      .finally(() => {
        this.setState({ isLoading: false})
      })

  }

  render() {
    const now = this.props.now
      return (
        <span>
          <span className="vert">
            <input type='button'
                   className="save-button"
                   onClick={() => this.save()}
                   value={this.state.saved? "\u2713" : "+"}/>
            {'\u00A0'}{'\u00A0'}{'\u00A0'}{'\u00A0'}
            {this.props.audio.private &&
              <i className="fas fa-lock">{'\u00A0'}</i>
            }
            <Link to={'/'+this.props.audio.op+'/'+this.props.audio.title} className="blackText">
              <div className="inline vert truncate">{this.props.audio.title}</div>
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
                {(now.status == 2
                  && now.metadata.created_at == this.props.audio.created_at
                  && now.metadata.audio == this.props.audio.audio) ?
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
