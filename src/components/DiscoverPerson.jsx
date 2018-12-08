import React, { Component } from 'react'
import {
  isSignInPending,
  loadUserData,
  Person,
  getFile,
  putFile,
  lookupProfile
} from 'blockstack'
const avatarFallbackImage = 'https://s3.amazonaws.com/onename/avatar-placeholder.png'

export default class DiscoverPerson extends React.Component {

  constructor(props) {
    super(props)
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
      following: false
    }
    this.fetchData = this.fetchData.bind(this)
    this.doClick = this.doClick.bind(this)
  }

  componentDidMount() {
    this.fetchData()
  }

  fetchData() {
    lookupProfile(this.props.username)
      .then((profile) => {
        this.setState({
          person: new Person(profile),
          following: this.props.following
        })

      })
      .catch((error) => {
        console.log('could not resolve profile')
      })
  }

  handleFollow() {
    var following = this.state.following
    this.setState({
      following: !following
    })
    this.props.handleFollow(this.props.username)
  }

  doClick() {
    window.location = this.props.username
  }

  render() {
    const { person } = this.state
    return (
      <span>
        <span className="pointer" onClick={this.doClick}>
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
                <span>{this.props.username.split('.')[0]}</span>
              </div>
            </div>
        </span>
        <span >
            <button
              className="btn btn-primary btn-lg"
              onClick={() => this.handleFollow()}
            >
              {this.state.following? "Following" : "Follow"}
            </button>
        </span>
      </span>
    )
    }


}
