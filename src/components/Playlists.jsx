import React, { Component } from 'react'
import {
  isSignInPending,
  loadUserData,
  getFile,
  putFile
} from 'blockstack'

import Player from './Player.jsx'
import ListPopup from './ListPopup.jsx'
const playlistsFileName = "playlists.json"

export default class Playlists extends Component {
  constructor(props) {
  	super(props)
  	this.state = {
      playlists: [],
      saved: [],
      view: -1,
      name: "",
      isLoading: false
  	}
    this.handleSave = this.handleSave.bind(this)
    this.selectChange = this.selectChange.bind(this)
    this.removeFromPlaylist = this.removeFromPlaylist.bind(this)
    this.deletePlaylist = this.deletePlaylist.bind(this)
  }

  componentDidMount() {
    // Playlists
    this.fetchPlaylists()
    // saved
    this.fetchSaved()
  }

  fetchPlaylists() {
    this.setState({ isLoading: true })
    const options = { decrypt: false, zoneFileLookupURL: 'https://core.blockstack.org/v1/names/' }
    getFile(playlistsFileName, options)
      .then((file) => {
        var playlists = JSON.parse(file || '[]')
        this.setState({
          playlists: playlists
        })
      })
      .finally(() => {
        this.setState({ isLoading: false })
      })
  }

  fetchSaved() {
    this.setState({ isLoading: true })
    getFile("saved.json", {decrypt:false})
      .then((file) => {
        var saved = JSON.parse(file || '[]')
        this.setState({saved: saved})
      })
      .catch((error) => {
        console.log('could not fetch follow info')
      })
  }

  handleSave(i) {
    var saved = this.state.saved
    const posts = this.state.playlists[this.state.view].songs
    if (this.isSaved(i))
      saved.forEach(function(save, j) {
        if (save.audio == posts[i].audio &&
            save.created_at == posts[i].created_at)
              saved.splice(j, 1);
      })
    else
      saved.unshift(posts[i])
    const options = { encrypt: false }
    putFile("saved.json", JSON.stringify(saved), options)
      .then(() => {
        this.setState({
          saved: saved
        })
      })
  }

  isSaved(i) {
    const saved = this.state.saved
    const posts = this.state.playlists[this.state.view].songs
    var retval = false
    saved.forEach(function(save) {
      if (save.audio == posts[i].audio &&
          save.created_at == posts[i].created_at)
            retval = true
    })
    return retval
  }

  removeFromPlaylist(i) {
    var playlists = this.state.playlists
    playlists[this.state.view].songs.splice(i, 1)
    this.setState({playlists: playlists})
    //update remote
    const options = { encrypt: false }
    putFile(playlistsFileName, JSON.stringify(playlists), options)
  }

  showPlayer(i) {
    if (this.state.isLoading) return null
    else {
      return <Player
              audio={this.state.playlists[this.state.view].songs[i]}
              local={false}
              id={i}
              saved={this.isSaved(i)}
              always={false}
              handleSave={this.handleSave}
              addToPlaylist={() => alert("Sorry, this action is not currently available.")}
              removeFromPlaylist={this.removeFromPlaylist}
            />
    }
  }

  newPlaylist(event) {
    event.preventDefault()
    //Set a variable to contain the DOM element of the overly
      var overlay = document.getElementById("overlay");
      //Set a variable to contain the DOM element of the popup
      var popup = document.getElementById("popup");

      //Changing the display css style from none to block will make it visible
      overlay.style.display = "block";
      //Same goes for the popup
      popup.style.display = "block";
  }
  closePopup() {
    //Set a variable to contain the DOM element of the overly
      var overlay = document.getElementById("overlay");
      //Set a variable to contain the DOM element of the popup
      var popup = document.getElementById("popup");

      //Changing the display css style from none to block will make it visible
      overlay.style.display = "none";
      //Same goes for the popup
      popup.style.display = "none";
  }
  handleNewPlaylistName() {
    this.setState({
      name: event.target.value
    })
  }
  createPlaylist(e) {
    event.preventDefault()
    var playlists = this.state.playlists
    var newPlaylist = {name: this.state.name, songs: []}

    playlists.push(newPlaylist)

    const options = { encrypt: false }
    putFile(playlistsFileName, JSON.stringify(playlists), options)
      .then(() => {
        this.setState({playlists: playlists, name: "", view: playlists.length - 1})
        document.getElementById("select-list").value = newPlaylist.name
      })

    this.closePopup()
  }

  changeView(i) {
    this.setState({view: i})
  }
  selectChange() {
    var select = document.getElementById('select-list')
    if (select.value == 'default') {
         this.setState({view: -1})
    } else {
      var index = 0
      this.state.playlists.forEach(function(element, i) {
        if (element.name == select.value) {
          index = i
        }
      })
      this.setState({view: index})
    }
  }

  deletePlaylist() {
    var playlists = this.state.playlists
    playlists.splice(this.state.view, 1)
    this.setState({
      playlists: playlists,
      view: -1
    })
    //update remote
    const options = { encrypt: false }
    putFile(playlistsFileName, JSON.stringify(playlists), options)
  }

  render() {
    return (
      !isSignInPending() ?
      <div className="container">
        <h1>Playlists</h1>
        <div className="row">
          <div className="col-md-offset-3 col-md-6">
            <div id="overlay"></div>
            <div id="popup">
              <div className="input-wrapper">
                <input className="upload-ting input-big"
                       type="text" autoFocus
                       placeholder="name"
                       onChange={e => this.handleNewPlaylistName()}/>
               </div>

               <span className="left">
                   <button
                     className="btn btn-primary btn-lg"
                     onClick={e => this.closePopup()}
                   >
                     Cancel
                   </button>
               </span>
               {'\u00A0'}{'\u00A0'}{'\u00A0'}{'\u00A0'}{'\u00A0'}
               {'\u00A0'}{'\u00A0'}{'\u00A0'}{'\u00A0'}{'\u00A0'}
               {'\u00A0'}{'\u00A0'}{'\u00A0'}{'\u00A0'}{'\u00A0'}
               {'\u00A0'}{'\u00A0'}{'\u00A0'}{'\u00A0'}{'\u00A0'}
               {'\u00A0'}{'\u00A0'}{'\u00A0'}{'\u00A0'}{'\u00A0'}
               {'\u00A0'}{'\u00A0'}{'\u00A0'}{'\u00A0'}{'\u00A0'}
               {'\u00A0'}{'\u00A0'}{'\u00A0'}{'\u00A0'}{'\u00A0'}
               {'\u00A0'}{'\u00A0'}{'\u00A0'}{'\u00A0'}{'\u00A0'}
               {'\u00A0'}{'\u00A0'}{'\u00A0'}{'\u00A0'}{'\u00A0'}
               {'\u00A0'}{'\u00A0'}{'\u00A0'}{'\u00A0'}{'\u00A0'}
               {'\u00A0'}{'\u00A0'}{'\u00A0'}{'\u00A0'}{'\u00A0'}
               {'\u00A0'}{'\u00A0'}{'\u00A0'}{'\u00A0'}{'\u00A0'}
               <span className="right">
                   <button
                     className="btn btn-primary btn-lg"
                     onClick={e => this.createPlaylist(e)}
                   >
                     Create
                   </button>
               </span>

            </div>
            <div className="col-md-12 posts">
              {!this.state.isLoading && this.state.playlists.length == 0 &&
              <h3>You don't have any playlists yet!</h3>}
              <table className="table-center">
                <tbody>
                <tr>
                  <th>
                    <select id="select-list" onChange={() => this.selectChange()}>
                      <option value="default">
                        Select a playlist
                      </option>
                      {this.state.playlists.map((playlist, i) => (
                          <option value={playlist.name} key={i}>
                            {playlist.name}
                          </option>
                          )
                      )}
                    </select>
                  </th>
                  <th>
                    <div className="col-md-12 text-right">
                      <button
                        className="btn btn-primary btn-lg"
                        onClick={e => this.newPlaylist(e)}
                      >
                        New Playlist
                      </button>
                    </div>
                  </th>
                  <th>
                    {this.state.view >= 0 &&
                      <div className="col-md-12 text-right dropdown">
                          <b>Options</b>
                          <div className="dropdown-content">
                            <a onClick={() => this.deletePlaylist()}>Delete</a>
                          </div>
                      </div>
                    }
                  </th>
                </tr>
              </tbody>
              </table>
              <br/><br/>

              <div className="col-md-12 posts">
                {this.state.isLoading && <h3>Loading...</h3>}
                {!this.state.isLoading && this.state.playlists.length > 0 &&
                  this.state.view >= 0 &&
                  this.state.playlists[this.state.view].songs.length == 0 &&
                  <h3>This playlist doesn't have any songs yet</h3>}
                {!this.state.isLoading && this.state.playlists.length > 0 &&
                  this.state.view >= 0 &&
                  this.state.playlists[this.state.view].songs.map((post, i) => (
                    <div className="post" key={i} >
                      {this.showPlayer(i)} <br/>
                      {"by "}
                      <a href={post.op}>{post.op.split('.')[0]}</a>
                    </div>
                    )
                )}
              </div>


            </div>
          </div>
        </div>
      </div> : null
    )
  }

}
