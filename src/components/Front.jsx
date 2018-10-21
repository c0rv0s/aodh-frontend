import React, { Component } from 'react'
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

const avatarFallbackImage = 'https://s3.amazonaws.com/onename/avatar-placeholder.png'
const postFileName = 'posts.json'

export default class Front extends Component {
  constructor(props) {
  	super(props)
    // fill in deafulat name
  	this.state = {
      follows: [],
      posts: [],
      isLoading: true
  	}
  }

  componentDidMount() {
    // follow or not
    this.fetchFollows()
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
      })
  }

  fetchData() {
    // fetch post list from every follow
    // compile a list by randomly sorting the first post in each uesr's list
    // set componenet state posts to this list
    var counter = 0
    var posts = this.state.posts
    this.state.follows.forEach(function(username) {
      const options = { username: username, decrypt: false, zoneFileLookupURL: 'https://core.blockstack.org/v1/names/'}
      getFile(postFileName, options)
        .then((file) => {
          var userposts = JSON.parse(file || '[]')
          posts.push(userposts[0])
          counter += 1
        })
        .catch((error) => {
          console.log('could not fetch posts')
        })
    })
    setInterval(() => {
      if (counter == this.state.follows.length) {
        posts.sort(function(a, b){
            var keyA = new Date(a.created_at),
                keyB = new Date(b.created_at);
            // Compare the 2 dates
            if(keyA < keyB) return -1;
            if(keyA > keyB) return 1;
            return 0;
        });
        this.setState({
          posts: posts,
          isLoading: false
        })
      }
    }, 5);
  }

  showPlayer(i) {
    if (this.state.isLoading) return null
    else {
      return <Player
              audio={this.state.posts[i]}
              local={false}
              id={i}
              handleDelete={this.handleDelete}
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
            <div className="col-md-12 posts">
              {this.state.isLoading && <span>Loading...</span>}
              {!this.state.isLoading && this.state.follows.length == 0 &&
              <h3>You aren't following anyone yet!</h3>}
              {this.state.posts.map((post, i) => (
                  <div className="post" key={i} >
                    {post.text}
                    {this.showPlayer(i)}<br/>
                    {"by "}
                    <a href={this.state.follows[i]}>{this.state.follows[i].split('.')[0]}</a>
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
