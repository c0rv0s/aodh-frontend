import React, { Component } from 'react'
import DiscoverPerson from './DiscoverPerson.jsx'
import {
  isSignInPending,
  loadUserData,
  Person,
  getFile,
  putFile,
  lookupProfile,
  showProfile
} from 'blockstack'

export default class Discover extends Component {
  constructor(props) {
  	super(props)
    // fill in deafulat name
  	this.state = {
      isLoading: true,
      follows: [],
      discover: []
  	}
    this.handleFollow = this.handleFollow.bind(this)
  }

  componentDidMount() {
    // follow or not
    this.fetchFollows()
    this.fetchDiscover()
  }

  fetchFollows() {
    const options = { decrypt: false}
    getFile("follows.json", options)
      .then((file) => {
        var follows = JSON.parse(file || '[]')
        this.setState({follows: follows})
      })
      .catch((error) => {
        console.log('could not fetch follow info')
        this.setState({isLoading: false})
      })
      .finally(() => {
        this.setState({isLoading: false})
      })
  }

  //retrive items from postgres
  fetchDiscover() {
    var discover = []
    var that = this
    fetch('https://aodh.xyz/api/list_ten')
      .then((response) => {
        response.json()
        .then((data) => {
          data.forEach(function(entry) {
            discover.push(entry.username)
          })
          that.setState({
            discover: discover
          })
        })
      })
  }

  handleFollow(username) {
    var follows = this.state.follows
    if (follows.includes(username)) {
      follows.splice(follows.indexOf(username))
    }
    else {
      follows.push(username)
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

  showUser(i) {
    return <DiscoverPerson
              username={this.state.discover[i]}
              following={this.state.follows.includes(this.state.discover[i])}
              handleFollow={this.handleFollow}
           />
  }

  render() {
    return (
      !isSignInPending() ?
      <div className="container">
        <h1>Discover</h1>
        <div className="row">
          <div className="col-md-offset-3 col-md-6">
            <div className="col-md-12 posts">
              {this.state.isLoading && <div className="lds-circle"></div>}
              {!this.state.isLoading && this.state.discover.length == 0 &&
              <h3>huh, looks like we couldn't find anything...</h3>}
              {this.state.discover.map((user, i) => (
                  <div className="post" key={i} >

                      {this.showUser(i)}<br/>

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
