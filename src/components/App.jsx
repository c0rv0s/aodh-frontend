import React, { Component } from 'react'
import Profile from './Profile.jsx'
import Front from './Front.jsx'
import Signin from './Signin.jsx'
import Upload from './Upload.jsx'
import Saved from './Saved.jsx'
import Playlists from './Playlists.jsx'
import Discover from './Discover.jsx'
import Contact from './Contact.jsx'
import Faq from './Faq.jsx'
import Footer from './Footer.jsx'
import Song from './Song.jsx'

import { Switch, Route, Link } from 'react-router-dom'
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
    this.state = {
      theme: "light"
    }
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

  changeTheme() {
    if (this.state.theme == 'light') {
      document.styleSheets[3].disabled = false
      this.setState({theme:'dark'})
    }
    if (this.state.theme == 'dark') {
      document.styleSheets[3].disabled = true
      this.setState({theme:'light'})
    }
  }

  theme() {
    if (this.state.theme == 'light')
      return <i className="fas fa-moon fa-2x theme" onClick={() => this.changeTheme()}></i>
    if (this.state.theme == 'dark')
      return <i className="fas fa-sun fa-2x theme" onClick={() => this.changeTheme()}></i>
  }

  render() {
    return (
      <div>
        {this.theme()}
      <div className="site-wrapper">
        <div className="navbar">
          <span className="left">
            <Link to="/"><b>Home</b></Link>
            { !isUserSignedIn() ? null :
              <Link to={'/'+loadUserData().username}><b>My Profile</b></Link>
            }
            <Link to="/discover"><b>Discover</b></Link>
          </span>

          <span className="right">

            <div className="dropdown">
                <b>Support</b>
                  <div className="dropdown-content">
                  <Link to="/faq">FAQ</Link>
                  <Link to="/contact">Contact</Link>
                </div>
            </div>
            <div className="dropdown">
                <b>Collection</b>
                  <div className="dropdown-content">
                  <Link to="/saved">Saved</Link>
                  <Link to="/playlists">Playlists</Link>
                </div>
            </div>
            <Link to="/upload"><b>Upload</b></Link>

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
                path='/upload'
                render={
                  routeProps => <Upload {...routeProps} />
                }
              />
              <Route
                path='/saved'
                render={
                  routeProps => <Saved {...routeProps} />
                }
              />
              <Route
                path='/playlists'
                render={
                  routeProps => <Playlists {...routeProps} />
                }
              />
              <Route
                path='/discover'
                render={
                  routeProps => <Discover {...routeProps} />
                }
              />
              <Route
                path='/contact'
                render={
                  routeProps => <Contact {...routeProps} />
                }
              />
              <Route
                path='/faq'
                render={
                  routeProps => <Faq {...routeProps} />
                }
              />
              <Route
                exact path='/:username'
                render={
                  routeProps => <Profile handleSignOut={ this.handleSignOut } {...routeProps} />
                }
              />
              <Route
                exact path='/:username/:title'
                render={
                  routeProps => <Song handleSignOut={ this.handleSignOut } {...routeProps} />
                }
              />
            </Switch>
          }
        </div>

        <Footer />

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
