import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import {
  isSignInPending,
  loadUserData,
  Person,
  getFile,
  putFile,
  lookupProfile,
  showProfile
} from 'blockstack'

import Player from './Player.jsx'
import ListPopup from './ListPopup.jsx'

const avatarFallbackImage = 'https://s3.amazonaws.com/onename/avatar-placeholder.png'
const postFileName = 'posts.json'
const playlistsFileName = "playlists.json"

export default class Front extends Component {
  constructor(props) {
  	super(props)
    // fill in deafulat name
  	this.state = {
      follows: [],
      posts: [],
      isLoading: true,
      showPlaylists: false,
      playlistSong: 0
  	}
    this.handleSave = this.handleSave.bind(this)
    this.isSaved = this.isSaved.bind(this)
    this.closePopup = this.closePopup.bind(this)
    this.addToPlaylist = this.addToPlaylist.bind(this)
    this.showPopup = this.showPopup.bind(this)
  }

  componentDidMount() {
    // get saved items
    this.fetchSaved()
    // follow or not
    this.fetchFollows()
  }

  handleDelete(){console.log("can't delete from front");}

  fetchSaved() {
    const options = { decrypt: false}
    getFile("saved.json", options)
      .then((file) => {
        var saved = JSON.parse(file || '[]')
        this.setState({saved: saved})
      })
      .catch((error) => {
        console.log('could not fetch follow info')
      })
  }

  fetchFollows() {
    const options = { decrypt: false}
    getFile("follows.json", options)
      .then((file) => {
        var follows = JSON.parse(file || '[]')
        this.setState({follows: follows})
        // Posts
        this.fetchData()
      })
      .catch((error) => {
        console.log('could not fetch follow info')
        this.setState({isLoading: false})
      })
  }

  fetchData() {
    // fetch post list from every follow
    // compile a list by date sorting the first post in each uesr's list
    // set componenet state posts to this list
    var counter = 0
    var posts = this.state.posts
    this.state.follows.forEach(function(username) {
      const options = { username: username, decrypt: false, zoneFileLookupURL: 'https://core.blockstack.org/v1/names/'}
      getFile(postFileName, options)
        .then((file) => {
          var userposts = JSON.parse(file || '[]')
          userposts = userposts.filter(post => !post.private)
          if (userposts.length > 0) {
            posts.push(userposts[0])
          }
        })
        .catch((error) => {
          console.log('could not fetch posts')
        })
        .finally(() => {
          counter += 1
        })
    })
    var sortInt = setInterval(() => {
      if (counter == this.state.follows.length) {
        if (posts.length > 0){
          posts.sort(function(a, b){
              var keyA = new Date(a.created_at),
                  keyB = new Date(b.created_at);
              // Compare the 2 dates
              if(keyA < keyB) return -1;
              if(keyA > keyB) return 1;
              return 0;
          });
        }
        this.setState({
          posts: posts,
          isLoading: false
        })
        clearInterval(sortInt)
      }
    }, 5);
  }

  handleSave(i) {
    var saved = this.state.saved
    const posts = this.state.posts
    if (this.isSaved(i))
      saved.forEach(function(save, j) {
        if (save.audio == posts[i].audio &&
            save.created_at == posts[i].created_at)
              saved.splice(j, 1);
      })
    else
      saved.unshift(this.state.posts[i])
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
    const posts = this.state.posts
    var retval = false
    saved.forEach(function(save) {
      if (save.audio == posts[i].audio &&
          save.created_at == posts[i].created_at)
            retval = true
    })
    return retval
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
    playlists[i].songs.push(this.state.posts[this.state.playlistSong])
    this.setState({playlists: playlists})
  }

  showPlayer(i) {
    if (this.state.isLoading) return null
    else {
      return <Player
              audio={this.state.posts[i]}
              local={this.state.posts[i].op == loadUserData().username}
              id={i}
              handleDelete={this.handleDelete}
              saved={this.isSaved(i)}
              always={false}
              handleSave={this.handleSave}
              addToPlaylist={this.showPopup}
            />
    }
  }

  render() {
    return (
      !isSignInPending() ?
      <div className="container">
        <h1>Posts From People You Follow</h1>
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
              {!this.state.isLoading && this.state.follows.length == 0 &&
              <h3>You aren't following anyone yet! Find new people in
                <Link to="/Discover"><b> Discover </b></Link> or
                  <Link to="/upload"><b> Upload </b></Link> something of your own
              </h3>}
              {!this.state.isLoading && this.state.follows.length > 0 &&
                this.state.posts.length == 0 &&
                <h3>Your follows haven't posted anything yet! Find new people in
                  <Link to="/Discover"><b> Discover </b></Link> or
                  <Link to="/upload"><b> Upload </b></Link> something of your own
                </h3>}
              {this.state.posts.map((post, i) => (
                  <div className="post" key={i} >
                      {this.showPlayer(i)}<br/>
                      {"by "}
                      <Link to={'/'+post.op}>{post.op.split('.')[0]}</Link>
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
