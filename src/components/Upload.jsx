import React, { Component } from 'react'
import {
  isSignInPending,
  loadUserData,
  Person,
  getFile,
  putFile,
  lookupProfile
} from 'blockstack'

import Accept from './Accept.jsx'
const postFileName = 'posts.json'

export default class Upload extends Component {
  constructor(props) {
  	super(props)
  	this.state = {
      description: "",
      title: "",
      audio: "",
      tags: "",
      posts: [],
      postIndex: 0,
      isUploading: false,
      isStillUploading: false,
      complete: false
  	}
    this.handleAccept = this.handleAccept.bind(this)
  }

  componentDidMount() {
    // Posts
    this.fetchData()
  }

  fetchData() {
      const options = { decrypt: false, zoneFileLookupURL: 'https://core.blockstack.org/v1/names/' }
      getFile(postFileName, options)
        .then((file) => {
          var posts = JSON.parse(file || '[]')
          this.setState({
            postIndex: posts.length,
            posts: posts,
          })
        })
        .catch(() => {
          this.setState({
            posts: false
          })
        })
        .finally(() => {
          console.log("success");
        })

  }

  handleNewPostChange(event) {
    this.setState({
      description: event.target.value
    })
  }

  handleNewTitleChange(event) {
    this.setState({
      title: event.target.value
    })
  }

  handleNewTagChange(event) {
    this.setState({
      tags: event.target.value
    })
  }

  handleAccept(accepted) {
    this.setState({
      audio: accepted[accepted.length - 1]
    })
  }

  handleNewPostSubmit(event) {
    event.preventDefault()
    // if (this.state.posts == false) alert("Something went wrong, try reloading the page")
    if (this.state.title == "") alert("Title missing")
    else if (this.state.audio == "") alert("Audio missing")
    else {
      this.setState({
        isUploading: true
      })
      var that = this
      setTimeout(function(){
        if (that.state.isUploading) {
          that.setState({
            isStillUploading: true
          })
        }
      }, 10000)
      this.saveNewPost()
    }
  }

  saveNewPost() {
    let postText = this.state.description
    let audio = this.state.audio
    let posts = this.state.posts
    let title = this.state.title
    let tags = this.state.tags
    let post = {
      id: this.state.postIndex++,
      title: title,
      text: postText.trim(),
      tags: tags.replace(/, /gi, ',').split(','),
      created_at: Date.now(),
      audio: audio.name,
      op: loadUserData().username,
      downloadable: document.getElementById("downloadable").checked,
      private: document.getElementById("private").checked
    }
    //console.log(post);
    // upload audio
    let filereader = new FileReader()
    const options = { encrypt: false }
    filereader.onload = (event) => {
      let result = event.target.result
      let path = audio.name// md5(result)

      putFile(path, result, options)
      .then(fileUrl => {
        console.log('uploaded: audio')
        // update list of posts on user account
        posts.unshift(post)
        putFile(postFileName, JSON.stringify(posts), options)
        // update state
        .then(() => {
          console.log('index updated');
          this.setState({
            posts: posts,
            isUploading: false,
            description: "",
            audio: "",
            title: "",
            tags: "",
            complete: true,
            isStillUploading: false
          })

        })
      })
      .catch((e) => {
        this.setState({
          isUploading: false,
        })
        console.error(e)
        alert("Something went wrong. If your file is over 25mb reduce its size and try again.")
      })
    }
    filereader.readAsDataURL(audio)
  }

  message() {
    if (this.state.complete)
    return <div className="header"><h1>Success! Your new upload is available on your profile.</h1></div>
    else
    return <div className="header"></div>
  }

  render() {

    return (
      !isSignInPending() ?
      <div className="container">
        <div className="row">
          <div className="col-md-offset-3 col-md-6">
            {this.state.isUploading &&
              <div>
            <div className="lds-grid"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>
            <p>Please don't navigate away or refresh the page until the upload is complete</p>
            {this.state.isStillUploading &&
              <p>Thank you for your patience. This may take a few minutes.</p>
            }
            </div>
          }
          {this.message()}
            {!this.state.isUploading &&
              <div className="new-post">
                <div className="col-md-12">
                  <div className="input-wrapper">
                    <input className="upload-ting input-big"
                           type="text" autoFocus
                           placeholder="title"
                           onChange={e => this.handleNewTitleChange(e)}/>
                  </div>
                <br />
                  <textarea className="upload-ting input-post"
                    value={this.state.description}
                    onChange={e => this.handleNewPostChange(e)}
                    placeholder="Description"
                  />
                <textarea className="upload-ting input-tags"
                    value={this.state.tags}
                    onChange={e => this.handleNewTagChange(e)}
                    placeholder="Tags (seperate with commas)"
                  /> <br />
                <input type="checkbox" name="downloadable" id="downloadable" />
                <label htmlFor="downloadable">{'\u00A0'}Allow downloads</label>
                {'\u00A0'}{'\u00A0'}{'\u00A0'}{'\u00A0'}{'\u00A0'}{'\u00A0'}
                {'\u00A0'}{'\u00A0'}{'\u00A0'}{'\u00A0'}{'\u00A0'}{'\u00A0'}
                <input type="checkbox" name="private" id="private" />
                <label htmlFor="private">{'\u00A0'}Private</label>
              </div>

                {'\u00A0'}
                <Accept
                  onAccept={this.handleAccept}
                />
                <div className="col-md-12 text-right">
                  <button
                    className="btn btn-primary btn-lg"
                    onClick={e => this.handleNewPostSubmit(e)}
                  >
                    Submit
                  </button>
                </div>
              </div>
            }
          </div>
        </div>
      </div> : null
    )
  }
}
