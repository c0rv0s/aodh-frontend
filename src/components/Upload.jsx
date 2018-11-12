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
    if (this.state.posts == false) alert("Something went wrong, try reloading the page")
    else if (this.state.title == "") alert("Title missing")
    else if (this.state.audio == "") alert("Audio missing")
    else {
      this.saveNewPost()
      this.setState({
        description: "",
        audio: "",
        title: "",
        tags: "",
        isUploading: true
      })
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
      audio: audio.name
    }
    console.log(post.tags);
    // upload audio
    let filereader = new FileReader()

    filereader.onload = (event) => {
      let result = event.target.result
      let path = audio.name// md5(result)

      putFile(path, result)
      .then(fileUrl => {
        console.log('uploaded: audio')
        // update list of posts on user account
        // post options
        const options = { encrypt: false }
        posts.unshift(post)
        putFile(postFileName, JSON.stringify(posts), options)
        // update state
        .then(() => {
          console.log('index updated');
          this.setState({
            posts: posts,
            isUploading: false,
            complete: true
          })

        })
      })
      .catch((e) => {
        this.setState({
          isUploading: false,
        })
        console.error(e)
        alert("Sorry, something didn't work out")
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
                  />
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
