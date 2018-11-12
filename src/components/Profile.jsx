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

const avatarFallbackImage = 'https://s3.amazonaws.com/onename/avatar-placeholder.png'
const postFileName = 'posts.json'

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
      username: "",
      description: "",
      audio: "",
      posts: [],
      postIndex: 0,
      isLoading: false,
      follows: [],
      isUploading: false,
      saved: []
  	}
    this.handleDelete = this.handleDelete.bind(this)
    this.handleFollow = this.handleFollow.bind(this)
    this.handleSave = this.handleSave.bind(this)
    this.isSaved = this.isSaved.bind(this)
  }

  componentDidMount() {
    this.fetchSaved()
    // Posts
    // this.fetchData()
    // follow or not
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
          console.log("posts");
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

      const options = { username: username, decrypt: false, zoneFileLookupURL: 'https://core.blockstack.org/v1/names/'}

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

  handleSave(id) {
    var saved = this.state.saved
    const posts = this.state.posts
    if (this.isSaved(id))
      for(var j=0; j<saved.length; j++) {
        if (saved[j].audio == posts[id].audio &&
            saved[j].created_at == posts[id].created_at)
              saved.splice(j, 1);
      }

    else
      saved.unshift(this.state.posts[id])
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
    for(var j=0; j<saved.length; j++) {
      if (saved[j].audio == posts[i].audio &&
          saved[j].created_at == posts[i].created_at)
            return true
    }
    return false
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
            <div className="col-md-12 posts">
              {this.state.isLoading && <span>Loading...</span>}
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
