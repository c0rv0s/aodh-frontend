import React, { Component } from 'react'
import {
  isSignInPending,
  loadUserData,
  Person,
  getFile,
  putFile,
  lookupProfile
} from 'blockstack'

import Accept from './Accept.jsx'
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
      isLoading: false
  	}
    this.handleAccept = this.handleAccept.bind(this)
  }

  componentDidMount() {
    this.fetchData()
  }

  handleNewPostChange(event) {
    this.setState({
      description: event.target.value
    })
  }

  handleAccept(accepted) {
    this.setState({
      audio: accepted[accepted.length - 1]
    })
  }

  handleNewPostSubmit(event) {
    event.preventDefault()
    this.saveNewPost()
    this.setState({
      description: "",
      audio: ""
    })
  }

  saveNewPost() {
    let postText = this.state.description
    let audio = this.state.audio
    let posts = this.state.posts

    let post = {
      id: this.state.postIndex++,
      text: postText.trim(),
      created_at: Date.now(),
      audio: audio.name
    }

    posts.unshift(post)

    // upload audio
    let filereader = new FileReader()

    filereader.onload = (event) => {
      let result = event.target.result

      let path = audio.name// md5(result)

      putFile(path, result)
      .then(fileUrl => {
        // console.log('uploaded: url',fileUrl)
      })
      .catch((e) => {
        console.error(e)
      })
    }

    filereader.readAsDataURL(audio)

    // upload post to user list of posts
    const options = { encrypt: false }
    putFile(postFileName, JSON.stringify(posts), options)
    // update state
      .then(() => {
        // console.log('index updated');
        this.setState({
          posts: posts
        })
      })
  }

  fetchData() {
    if (this.isLocal()) {
      this.setState({ isLoading: true })
      const options = { decrypt: false, zoneFileLookupURL: 'https://core.blockstack.org/v1/names/' }
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
        .finally(() => {
          this.setState({ isLoading: false })
        })
    } else {
      const username = this.props.match.params.username
      this.setState({ isLoading: true })

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
    return this.props.match.params.username ? false : true
  }

  showPlayer(id) {
    if (this.state.isLoading) return null
    else {
      var index = 0
      for (var i=0; i < this.state.posts.length; i++) {
        if (this.state.posts[i].id == id) {
          index = i
          break
        }
      }
      return <Player
              audio={this.state.posts[index]}
              username={this.state.username}
              local={this.isLocal}
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
                  <span>{username}</span>
                  {this.isLocal() &&
                    <span>
                      {'\u00A0'}{'\u00A0'}
                      <a onClick={ handleSignOut.bind(this) }>(Logout)</a>
                    </span>
                  }
                </div>
              </div>
            </div>
            {this.isLocal() &&
              <div className="new-post">
                <div className="col-md-12">
                  <textarea className="input-post"
                    value={this.state.description}
                    onChange={e => this.handleNewPostChange(e)}
                    placeholder="Track Title/Description"
                  />
                </div>
                {'\u00A0'}
                <Accept
                  onAccept={this.handleAccept}
                />
                <div className="col-md-12 text-right">
                  <button
                    className="btn btn-primary btn-lg"
                    onClick={e => this.handleNewPostSubmit(e)}
                  >
                    Submit
                  </button>
                </div>
              </div>
            }
            <div className="col-md-12 posts">
            {this.state.isLoading && <span>Loading...</span>}
            {this.state.posts.map((post) => (
                <div className="post" key={post.id} >
                  {post.text}
                  {this.showPlayer(post.id)}
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
