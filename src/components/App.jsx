import React, { Component, Link } from 'react'
import Profile from './Profile.jsx'
import Front from './Front.jsx'
import Signin from './Signin.jsx'
import Upload from './Upload.jsx'
import Saved from './Saved.jsx'
import Playlists from './Playlists.jsx'
import Discover from './Discover.jsx'
import Contact from './Contact.jsx'
import Faq from './Faq.jsx'

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
                <b>Support</b>
                  <div className="dropdown-content">
                  <a href="/faq">FAQ</a>
                  <a href="/contact">Contact</a>
                </div>
            </div>
            <div className="dropdown">
                <b>Collection</b>
                  <div className="dropdown-content">
                  <a href="/saved">Saved</a>
                  <a href="/playlists">Playlists</a>
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
                exact path='/contact'
                render={
                  routeProps => <Contact {...routeProps} />
                }
              />
              <Route
                exact path='/faq'
                render={
                  routeProps => <Faq {...routeProps} />
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

        var request = new Request('https://aodh.xyz/api/add_user', {
          method: 'POST',
          headers: new Headers({'Content-Type': 'application/json'}),
          body: JSON.stringify({username: userData.username})
        })

        fetch(request)
        .then((response) => {
          // console.log(response);
        })
        .catch((err) => {
          console.log(err);
        })
      })
    }
  }
}
