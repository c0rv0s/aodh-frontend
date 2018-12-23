import React, { Component } from 'react'
import {
  isSignInPending,
  loadUserData,
  getFile,
  putFile
} from 'blockstack'

import Player from './Player.jsx'
import ListPopup from './ListPopup.jsx'
const savedFileName = "saved.json"
const playlistsFileName = "playlists.json"

export default class Saved extends Component {
  constructor(props) {
  	super(props)
  	this.state = {
      saved: [],
      isLoading: false,
      showPlaylists: false,
      playlistSong: 0
  	}
    this.handleSave = this.handleSave.bind(this)
    this.closePopup = this.closePopup.bind(this)
    this.addToPlaylist = this.addToPlaylist.bind(this)
    this.showPopup = this.showPopup.bind(this)
  }

  componentDidMount() {
    // Likes
    this.fetchData()
  }

  fetchData() {
    this.setState({ isLoading: true })
    const options = { decrypt: false, zoneFileLookupURL: 'https://core.blockstack.org/v1/names/' }
    getFile(savedFileName, options)
      .then((file) => {
        var saved = JSON.parse(file || '[]')
        this.setState({
          saved: saved
        })
      })
      .finally(() => {
        this.setState({ isLoading: false })
      })
  }

  handleSave(id) {
    var saved = this.state.saved
    saved.splice(id, 1);
    const options = { encrypt: false }
    putFile(savedFileName, JSON.stringify(saved), options)
      .then(() => {
        this.setState({
          saved: saved
        })
      })
  }

  showPopup(i) {
    const options = { decrypt: false, zoneFileLookupURL: 'https://core.blockstack.org/v1/names/' }
    getFile(playlistsFileName, options)
      .then((file) => {
        var playlists = JSON.parse(file || '[]')
        this.setState({
          showPlaylists: true,
          playlistSong: i,
          playlists: playlists
        })
      })
  }
  closePopup() {
    const playlists = this.state.playlists
    const options = { encrypt: false }
    putFile(playlistsFileName, JSON.stringify(playlists), options)
      .then(() => {
        this.setState({showPlaylists: false, playlistSong: 0})
      })
  }
  fetchListNames() {
    var set = []
    this.state.playlists.forEach(function(list){
      set.push(list.name)
    })
    return set
  }
  addToPlaylist(i) {
    var playlists = this.state.playlists
    playlists[i].songs.push(this.state.saved[this.state.playlistSong])
    this.setState({playlists: playlists})
  }

  showPlayer(i) {
    if (this.state.isLoading) return null
    else {
      return <Player
              audio={this.state.saved[i]}
              local={false}
              id={i}
              saved={true}
              always={true}
              handleSave={this.handleSave}
              addToPlaylist={this.showPopup}
            />
    }
  }

  render() {
    return (
      !isSignInPending() ?
      <div className="container">
        <h1>Saved</h1>
        <div className="row">
          <div className="col-md-offset-3 col-md-6">
            {this.state.showPlaylists &&
              <ListPopup playlists={this.fetchListNames()}
                         closePopup={this.closePopup}
                         add={this.addToPlaylist}
              />
            }
            <div className="col-md-12 posts">
              {this.state.isLoading && <div className="lds-circle"></div>}
              {!this.state.isLoading && this.state.saved.length == 0 &&
              <h3>You haven't saved anything yet!</h3>}
              {this.state.saved.map((post, i) => (
                  <div className="post" key={i} >
                    {this.showPlayer(i)}<br/>
                    {"by "}
                    <a href={this.state.saved[i].op}>{this.state.saved[i].op.split('.')[0]}</a>
                  </div>
                  )
              )}
            </div>
          </div>
        </div>
      </div> : null
    )
  }

}
