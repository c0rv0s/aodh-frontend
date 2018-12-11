import React, { Component } from 'react'

export default class Faq extends Component {

  render() {

    return (
      <div className="container">
        <h1>FAQ</h1>
        <div className="row">
          <div className="col-md-offset-3 col-md-6 left-align">

            <h3>How do I change my profile picture, name or bio?</h3>
            <p>These are fetched from your Blockstack profile. Open the blockstack
            browser and you'll be able to change these values under the 'IDs'
            section</p> <br/>

            <h3>I don't want people to see my profile in the Discover tab.</h3>
            <p>Click on 'My Profile'. Under your bio is a checkbox titled
            'Discoverable'. Uncheck this and you will no longer appear under
            Discover.</p> <br/>

            <h3>Where is my data?</h3>
            <p>All of your data - including uploads, playlists, the people you
            follow and the posts you've saved are kept in your Blockstack profile.
            You can find more information on this at https://blockstack.org</p> <br/>

            <h3>Something about aodh.xyz isn't responding properly</h3>
            <p>Aodh is still in beta right now. If something does not respond as
            expected please use the Contact page to reach us with a detailed description
            of what went wrong.</p> <br/>

          </div>
        </div>
      </div>
    )
  }
}
