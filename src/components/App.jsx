import React, { Component, Link } from 'react'
import Profile from './Profile.jsx'
import Front from './Front.jsx'
import Signin from './Signin.jsx'
import Upload from './Upload.jsx'
import Saved from './Saved.jsx'
import Playlists from './Playlists.jsx'
import Discover from './Discover.jsx'

import { Switch, Route } from 'react-router-dom'
import {
  isSignInPending,
  isUserSignedIn,
  redirectToSignIn,
  handlePendingSignIn,
  signUserOut,
  loadUserData
} from 'blockstack'

export default class App extends Component {

  constructor(props) {
  	super(props)
  }

  handleSignIn(e) {
    e.preventDefault();
    const origin = window.location.origin
    redirectToSignIn(origin, origin + '/manifest.json', ['store_write', 'publish_data'])
  }

  handleSignOut(e) {
    e.preventDefault();
    signUserOut(window.location.origin);
  }

  render() {
    return (
      <div className="site-wrapper">
        <div className="navbar">
          <span className="left">
            <a href="/"><b>Home</b></a>
            { !isUserSignedIn() ? null :
              <a href={loadUserData().username}><b>My Profile</b></a>
            }
            <a href="/discover"><b>Discover</b></a>
          </span>

          <span className="right">
            <div className="dropdown">
                <b>Collection</b>
                  <div className="dropdown-content">
                  <a  href="/saved">Saved</a>
                  <a  href="/playlists">Playlists</a>
                </div>
            </div>
            <a href="/upload"><b>Upload</b></a>
          </span>

        </div>

        <div className="site-wrapper-inner">
          { !isUserSignedIn() ?
            <Signin handleSignIn={ this.handleSignIn } />
            :
            <Switch>
              <Route
                exact path='/'
                render={
                  routeProps => <Front {...routeProps} />
                }
              />
              <Route
                exact path='/upload'
                render={
                  routeProps => <Upload {...routeProps} />
                }
              />
              <Route
                exact path='/saved'
                render={
                  routeProps => <Saved {...routeProps} />
                }
              />
              <Route
                exact path='/playlists'
                render={
                  routeProps => <Playlists {...routeProps} />
                }
              />
              <Route
                exact path='/discover'
                render={
                  routeProps => <Discover {...routeProps} />
                }
              />
              <Route
                path='/:username'
                render={
                  routeProps => <Profile handleSignOut={ this.handleSignOut } {...routeProps} />
                }
              />
            </Switch>
          }
        </div>
      </div>
    )
  }

  componentWillMount() {
    if (isSignInPending()) {
      handlePendingSignIn().then((userData) => {
        window.location = window.location.origin
      })
    }
  }
}
