import React, { Component } from 'react'
import {
  isSignInPending,
  loadUserData,
  Person,
  getFile,
  putFile,
  lookupProfile
} from 'blockstack'

import Player from './Player.jsx'
import ListPopup from './ListPopup.jsx'

const avatarFallbackImage = 'https://s3.amazonaws.com/onename/avatar-placeholder.png'
const postFileName = 'posts.json'
const playlistsFileName = "playlists.json"

export default class Profile extends Component {
  constructor(props) {
  	super(props)
    // fill in deafulat name
    var anon = '👨‍🎤 '
    if ( Math.floor(Math.random() * 2) <  1) anon = '👩‍🎤 '
    switch(Math.floor(Math.random() * 5)) {
      case 0:
        anon += '🎤 🎼'
        break
      case 1:
        anon += '🎧 🎵🎵🎶'
        break
      case 2:
        anon += '🥁'
        break
      case 3:
        anon += '🎹'
      case 4:
        anon += '🎸'
        break
      default:
        break
    }
  	this.state = {
  	  person: {
  	  	name() {
          return anon
        },
  	  	avatarUrl() {
  	  	  return avatarFallbackImage
  	  	},
  	  },
      posts: [],
      username: "",
      postIndex: 0,
      isLoading: false,
      follows: [],
      saved: [],
      showPlaylists: false,
      playlistSong: 0
  	}
    this.handleDelete = this.handleDelete.bind(this)
    this.handleFollow = this.handleFollow.bind(this)
    this.handleSave = this.handleSave.bind(this)
    this.isSaved = this.isSaved.bind(this)
    this.closePopup = this.closePopup.bind(this)
    this.addToPlaylist = this.addToPlaylist.bind(this)
    this.showPopup = this.showPopup.bind(this)
  }

  componentDidMount() {
    this.fetchSaved()
    this.fetchFollows()

  }

  handleNewPostChange(event) {
    this.setState({
      description: event.target.value
    })
  }

  fetchFollows() {
    if (!this.isLocal()) {
      const options = { decrypt: false}
      getFile("follows.json", options)
        .then((file) => {
          var follows = JSON.parse(file || '[]')
          this.setState({follows: follows})
        })
        .catch((error) => {
          console.log('could not fetch follow info')
        })
    }
  }

  handleDelete(id) {
    const posts = this.state.posts
    posts.splice(id, 1);
    const options = { encrypt: false }
    putFile(postFileName, JSON.stringify(posts), options)
      .then(() => {
        this.setState({
          posts: posts,
          postIndex: posts.length,
        })
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
      .finally(() => {this.fetchData()})
  }

  fetchData() {
    const options = { decrypt: false, zoneFileLookupURL: 'https://core.blockstack.org/v1/names/' }
    this.setState({ isLoading: true })

    if (this.isLocal()) {

      getFile(postFileName, options)
        .then((file) => {
          var posts = JSON.parse(file || '[]')
          this.setState({
            person: new Person(loadUserData().profile),
            username: loadUserData().username,
            postIndex: posts.length,
            posts: posts,
          })
        })
        .catch((error) => {
          console.log('could not fetch posts')
        })
        .finally(() => {
          this.setState({ isLoading: false })
        })
    } else {
      const username = this.props.match.params.username
      lookupProfile(username)
        .then((profile) => {
          this.setState({
            person: new Person(profile),
            username: username
          })
        })
        .catch((error) => {
          console.log('could not resolve profile')
        })

      const options = { username: username, decrypt: false}

      getFile(postFileName, options)
        .then((file) => {
          var posts = JSON.parse(file || '[]')
          this.setState({
            postIndex: posts.length,
            posts: posts
          })
        })
        .catch((error) => {
          console.log('could not fetch posts')
        })
        .finally(() => {
          this.setState({ isLoading: false })
        })
    }
  }

  isLocal() {
    return this.props.match.params.username == loadUserData().username ? true : false
  }

  handleFollow(event) {
    event.preventDefault()
    var follows = this.state.follows
    if (follows.includes(this.props.match.params.username)) {
      follows.splice(follows.indexOf(this.props.match.params.username))
    }
    else {
      follows.push(this.props.match.params.username)
    }
    const options = { encrypt: false }

    putFile("follows.json", JSON.stringify(follows), options)
    // update state
    .then(() => {
      console.log("follow saved");
      this.setState({
        follows: follows
      })
    })
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
    const playlists = this.state.playlists
    playlists[i].songs.push(this.state.posts[this.state.playlistSong])
    this.setState({playlists: playlists})
  }

  showPlayer(i) {
    if (this.state.isLoading) return null
    else {
      return <Player
              audio={this.state.posts[i]}
              local={this.isLocal()}
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
    const { handleSignOut } = this.props
    const { person } = this.state
    const { username } = this.state

    return (
      !isSignInPending() && person ?
      <div className="container">
        <div className="row">
          <div className="col-md-offset-3 col-md-6">
            {this.state.showPlaylists &&
              <ListPopup playlists={this.fetchListNames()}
                         closePopup={this.closePopup}
                         add={this.addToPlaylist}
              />
            }
            <div className="col-md-12">
              <div className="avatar-section">
                <img
                  src={ person.avatarUrl() ? person.avatarUrl() : avatarFallbackImage }
                  className="img-rounded avatar"
                  id="avatar-image"
                />
                <div className="username">
                  <h1>
                    <span id="heading-name">{ person.name() ? person.name()
                      : 'Nameless Person' }</span>
                  </h1>
                  <span>{username.split('.')[0]}</span>
                  {this.isLocal() &&
                    <span>
                      {'\u00A0'}{'\u00A0'}
                      <a className="logout" onClick={ handleSignOut.bind(this) }>(Logout)</a>
                    </span>
                  }
                </div>
              </div>
            </div>
            {!this.isLocal() &&
              <button
                className="btn btn-primary btn-lg"
                onClick={e => this.handleFollow(e)}
              >
                {this.state.follows.includes(this.props.match.params.username)? "Following" : "Follow"}
              </button>
            }
            {this.isLocal() && false &&
              <div>
                <input type="checkbox" name="discoverable"id="discoverable" />
                <label htmlFor="discoverable"> Discoverable</label>
              </div>
            }
            <div className="col-md-12 posts">
              {this.state.isLoading && <span>Loading...</span>}
              {!this.state.isLoading && this.state.posts.length == 0 && this.isLocal() &&
              <h3>You haven't uploaded anything yet!</h3>}
              {!this.state.isLoading && this.state.posts.length == 0 && !this.isLocal() &&
              <h3>This user hasn't uploaded anything yet!</h3>}
              {!this.state.isLoading &&
                this.state.posts.map((post, i) => (
                  <div className="post" key={i} >
                    {this.showPlayer(i)}
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
