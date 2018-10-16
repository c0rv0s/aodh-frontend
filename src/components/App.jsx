import React, { Component, Link } from 'react'
import Profile from './Profile.jsx'
import Front from './Front.jsx'
import Signin from './Signin.jsx'
import { Switch, Route } from 'react-router-dom'
import {
  isSignInPending,
  isUserSignedIn,
  redirectToSignIn,
  handlePendingSignIn,
  signUserOut,
} from 'blockstack'

export default class App extends Component {

  constructor(props) {
  	super(props)
  }

  handleSignIn(e) {
    e.preventDefault()
    redirectToSignIn()
    const origin = window.location.origin
    redirectToSignIn(origin, origin + '/manifest.json', ['store_write', 'publish_data'])
  }

  handleSignOut(e) {
    e.preventDefault()
    signUserOut(window.location.origin)
  }

  render() {
    return (
      <div className="site-wrapper">
        <div className="site-wrapper-inner">
          { !isUserSignedIn() ?
            <Signin handleSignIn={ this.handleSignIn } />
            :
            <Switch>
              <Route exact
                path='/'
                render={
                  routeProps => <Front {...routeProps} />
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
