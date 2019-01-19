import React, { Component } from 'react'
import { Link } from 'react-router-dom'
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

const postFileName = 'posts.json'
const playlistsFileName = "playlists.json"

export default class Song extends Component {
  constructor(props) {
  	super(props)
  	this.state = {
  	  person: {
  	  	name() {
          return anon
        },
  	  	avatarUrl() {
  	  	  return avatarFallbackImage
  	  	},
        description() {
          return ""
        }
  	  },
      song: {op: '...'},
      posts: [],
      username: "",
      isLoading: false,
      follows: [],
      saved: [],
      showPlaylists: false
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

  componentWillReceiveProps(nextProps) {
    if(nextProps.match.params.username != this.state.username ||
      nextProps.match.params.title != this.props.match.params.title) {
        this.fetchData(this.props.match.params.username)
    }
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
      .finally(() => {this.fetchData(this.props.match.params.username)})
  }

  fetchData(usr) {
    const options = { decrypt: false, zoneFileLookupURL: 'https://core.blockstack.org/v1/names/' }
    this.setState({ isLoading: true })

    if (usr == loadUserData().username) {
      getFile(postFileName, options)
        .then((file) => {
          var posts = JSON.parse(file || '[]')
          var matches = posts.filter(s => s.title == this.props.match.params.title)
          var song
          if (matches.length < 1) {
            song = {op: null}
          }
          else {
            song = matches[0]
          }
          this.setState({
            person: new Person(loadUserData().profile),
            username: loadUserData().username,
            posts: posts,
            song: song
          })
        })
        .catch((error) => {
          console.log('could not fetch posts(local)')
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
          posts = posts.filter(post => !post.private)
          var matches = posts.filter(s => s.title == this.props.match.params.title)
          var song
          if (matches.length < 1) {
            song = {op: null}
          }
          else {
            song = matches[0]
          }
          this.setState({
            posts: posts,
            song: song
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

  handleSave() {
    var saved = this.state.saved
    const post = this.state.song
    if (this.isSaved())
      saved.forEach(function(save, j) {
        if (save.audio == song.audio &&
            save.created_at == song.created_at)
              saved.splice(j, 1);
      })
    else
      saved.unshift(this.state.song)
    const options = { encrypt: false }
    putFile("saved.json", JSON.stringify(saved), options)
      .then(() => {
        this.setState({
          saved: saved
        })
      })
  }

  isSaved() {
    const saved = this.state.saved
    const song = this.state.song
    var retval = false
    saved.forEach(function(save) {
      if (save.audio == song.audio &&
          save.created_at == song.created_at)
            retval = true
    })
    return retval
  }

  showPopup() {
    const options = { decrypt: false, zoneFileLookupURL: 'https://core.blockstack.org/v1/names/' }
    getFile(playlistsFileName, options)
      .then((file) => {
        var playlists = JSON.parse(file || '[]')
        this.setState({
          showPlaylists: true,
          playlists: playlists
        })
      })
  }
  closePopup() {
    const playlists = this.state.playlists
    const options = { encrypt: false }
    putFile(playlistsFileName, JSON.stringify(playlists), options)
      .then(() => {
        this.setState({showPlaylists: false})
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
    playlists[i].songs.push(this.state.song)
    this.setState({playlists: playlists})
  }


  showPlayer() {
    if (this.state.isLoading) return null
    else {
      return <Player
              audio={this.state.song}
              local={this.isLocal()}
              id={0}
              handleDelete={this.handleDelete}
              saved={this.isSaved()}
              always={false}
              handleSave={this.handleSave}
              addToPlaylist={this.showPopup}
              now={this.props.now}
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

            <div className="col-md-12 posts">
              {this.state.song.op != null ?
                <div className="post" >
                  {this.showPlayer()}<br/>
                  {"by "}
                  <Link to={'/'+this.state.song.op}>{this.state.song.op.split('.')[0]}</Link>
                  <br /><br />
                  <div className="left-text">
                    <p>{this.state.song.text}</p>
                  </div>
                  <br />
                </div>
                :
                <div>
                    <h3>Unfortunately this song by
                      <Link to={'/'+this.props.match.params.username}>
                        {" "+this.props.match.params.username.split('.')[0]+" "}
                      </Link>
                      does not exist.
                    </h3>
                  </div>
              }
            </div>
            {!this.isLocal() &&
              <button
                className="btn btn-primary btn-lg"
                onClick={e => this.handleFollow(e)}
              >
                {this.state.follows.includes(this.props.match.params.username)? "Following" : "Follow"}
              </button>
            }
          </div>
        </div>
      </div> : null
    )
  }
}
