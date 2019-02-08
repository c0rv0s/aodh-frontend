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
      discover: [],
      ids: [],
      max: false
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
    var ids = this.state.ids
    var discover = this.state.discover
    var that = this
    var self = loadUserData().username

    var data = {d: ids}
    var request = new Request('https://aodh.xyz/api/list_ten', {
      method: 'POST',
      headers: new Headers({'Content-Type': 'application/json'}),
      body: JSON.stringify(data)
    })

    fetch(request)
    .then((response) => {
      response.json()
      .then((data) => {
        if (typeof data.rows === "undefined" || data.rows.length === 0 && that.state.discover.length > 0) {
          that.setState({
            max: true
          })
        }
        else {
          data.rows.forEach(function(entry) {
            if (entry.username != "derpderpderp.id.blockstack" &&
                entry.username != null &&
                entry.username != self)
              discover.push({username: entry.username,posts:entry.posts})
          })
          var new_ids = ids.concat(data.ids)
          that.setState({
            discover: discover,
            ids: new_ids
          })
        }
      })
    })
    .catch((err) => {
      console.log(err);
      that.setState({
        max: true
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
              user={this.state.discover[i]}
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
              <h3>Huh, looks like we couldn't find anything...<br/><br/>Try checking back later</h3>}
              {this.state.discover.map((user, i) => (
                  <div className="post" key={i} >

                      {this.showUser(i)}<br/>

                  </div>
                  )
              )}
              <br /><br />
              {this.state.max &&
                <h3>That's everyone!</h3>
              }
              {(this.state.discover.length >= 1) && !this.state.max &&
                <button
                  className="btn btn-primary btn-lg"
                  onClick={() => this.fetchDiscover()}
                >Load More</button>
              } <br/><br/><br/><br/><br/><br/>
            </div>
          </div>
        </div>
      </div> : null
    )
  }
}
