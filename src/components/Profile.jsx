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
      isLoading: false,
      follows: [],
      isUploading: false
  	}
    this.handleAccept = this.handleAccept.bind(this)
    this.handleDelete = this.handleDelete.bind(this)
    this.handleFollow = this.handleFollow.bind(this)
  }

  componentDidMount() {
    // Posts
    this.fetchData()
    // follow or not
    this.fetchFollows()
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
      audio: "",
      isUploading: true
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


    // upload audio
    let filereader = new FileReader()

    filereader.onload = (event) => {
      let result = event.target.result
      let path = audio.name// md5(result)

      putFile(path, result)
      .then(fileUrl => {
        console.log('uploaded: audio')
        // update list of posts on user account
        // post options
        const options = { encrypt: false }
        posts.unshift(post)
        putFile(postFileName, JSON.stringify(posts), options)
        // update state
        .then(() => {
          console.log('index updated');
          this.setState({
            posts: posts,
            isUploading: false
          })
        })
      })
      .catch((e) => {
        console.error(e)
      })
    }
    filereader.readAsDataURL(audio)
  }

  handleDelete(id) {
    const posts = this.state.posts.filter((post) => post.id !== id)
    const options = { encrypt: false }
    putFile(postFileName, JSON.stringify(posts), options)
      .then(() => {
        this.setState({
          posts: posts,
          postIndex: posts.length,
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

  showPlayer(i) {
    if (this.state.isLoading) return null
    else {
      return <Player
              audio={this.state.posts[i]}
              local={this.isLocal()}
              id={i}
              handleDelete={this.handleDelete}
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
            {this.state.isUploading &&
            <div className="lds-grid"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>
            }
            {this.isLocal() && !this.state.isUploading &&
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
              {this.state.posts.map((post, i) => (
                  <div className="post" key={i} >
                    {post.text}
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
