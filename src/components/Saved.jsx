import React, { Component } from 'react'
import {
  isSignInPending,
  loadUserData,
  getFile,
  putFile
} from 'blockstack'

import Player from './Player.jsx'
const savedFileName = "saved.json"

export default class Saved extends Component {
  constructor(props) {
  	super(props)
  	this.state = {
      saved: [],
      isLoading: false
  	}
    this.handleSave = this.handleSave.bind(this)
  }

  componentDidMount() {
    // Likes
    this.fetchData()
  }

  fetchData() {
    this.setState({ isLoading: true })
    const options = { decrypt: false, zoneFileLookupURL: 'https://core.blockstack.org/v1/names/' }
    getFile(savedFileName, options)
      .then((file) => {
        var saved = JSON.parse(file || '[]')
        this.setState({
          saved: saved
        })
      })
      .finally(() => {
        this.setState({ isLoading: false })
      })
  }

  handleSave(id) {
    var saved = this.state.saved
    saved.splice(id, 1);
    const options = { encrypt: false }
    putFile("saved.json", JSON.stringify(saved), options)
      .then(() => {
        this.setState({
          saved: saved
        })
      })
  }

  showPlayer(i) {
    if (this.state.isLoading) return null
    else {
      return <Player
              audio={this.state.saved[i]}
              local={true}
              id={i}
              saved={true}
              always={true}
              handleSave={this.handleSave}
            />
    }
  }

  render() {
    return (
      !isSignInPending() ?
      <div className="container">
        <h1>Saved</h1>
        <div className="row">
          <div className="col-md-offset-3 col-md-6">
            <div className="col-md-12 posts">
              {this.state.isLoading && <div className="lds-circle"></div>}
              {!this.state.isLoading && this.state.saved.length == 0 &&
              <h3>You haven't saved anything yet!</h3>}
              {this.state.saved.map((post, i) => (
                  <div className="post" key={i} >
                    {this.showPlayer(i)}<br/>
                    {"by "}
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
