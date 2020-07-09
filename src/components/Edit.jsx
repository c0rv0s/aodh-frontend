import React, { Component } from 'react'
import {
  isSignInPending,
  loadUserData,
  Person,
  getFile,
  putFile,
  lookupProfile
} from 'blockstack'

const postFileName = 'posts.json'

export default class Edit extends Component {
  constructor(props) {
  	super(props)
  	this.state = {
      posts: [],
      postIndex: 0,

      title: "",
      description: "",
      tags: "",
      downloadable: false,
      private: false,
  	}
  }

  componentDidMount() {
    this.fetchData()
    var overlay = document.getElementById("overlay");
    //Set a variable to contain the DOM element of the popup
    var popup = document.getElementById("edit-popup");

    //Changing the display css style from none to block will make it visible
    overlay.style.display = "block";
    //Same goes for the popup
    popup.style.display = "block";
  }

  componentWillUnmount() {
    var overlay = document.getElementById("overlay");
    //Set a variable to contain the DOM element of the popup
    var popup = document.getElementById("edit-popup");

    //Changing the display css style from none to block will make it visible
    overlay.style.display = "none";
    //Same goes for the popup
    popup.style.display = "none";
  }

  fetchData() {
    var posts = this.props.posts
    document.getElementById("downloadable").checked = posts[this.props.postid].downloadable;
    document.getElementById("private").checked = posts[this.props.postid].private;
    var t = ""
    var h
    for (h in posts[this.props.postid].tags)
      t += posts[this.props.postid].tags[h] + ","
    t = t.slice(0,-1)

    this.setState({
      postIndex: posts.length,
      posts: posts,

      title: posts[this.props.postid].title,
      description: posts[this.props.postid].text,
      tags: t,
      downloadable: posts[this.props.postid].downloadable,
      private: posts[this.props.postid].private
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

  handleNewPostSubmit(event) {
    const options = { encrypt: false}
    event.preventDefault()
    // if (this.state.posts == false) alert("Something went wrong, try reloading the page")
    if (this.state.title == "") alert("Title missing")
    else {
      let posts = this.state.posts
      let tags = this.state.tags
      var post = {
        id: this.props.postid,
        title: this.state.title,
        text: this.state.description.trim(),
        tags: tags.replace(/, /gi, ',').split(','),
        created_at: posts[this.props.postid].created_at,
        audio: posts[this.props.postid].audio,
        op: posts[this.props.postid].op,
        downloadable: document.getElementById("downloadable").checked,
        private: document.getElementById("private").checked
      }
      posts[this.props.postid] = post
      putFile(postFileName, JSON.stringify(posts), options)
    }
    this.props.closePopup()
  }

  render() {

    return (
      !isSignInPending() ?
      <div>
        <div id="overlay"></div>
          <div id="edit-popup">
          <div className=" new-edit">
            <div className="col-md-12">
              <div className="input-wrapper">
                <input className="upload-ting input-big"
                        type="text" autoFocus
                        value={this.state.title}
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
                <br />
                <br />
            </div>

            <span className="left">
                  <b className=" pointer" onClick={e => this.props.closePopup()}>Cancel</b>
            </span>
            {'\u00A0'}{'\u00A0'}{'\u00A0'}{'\u00A0'}{'\u00A0'}
            {'\u00A0'}{'\u00A0'}{'\u00A0'}{'\u00A0'}{'\u00A0'}
            {'\u00A0'}{'\u00A0'}{'\u00A0'}{'\u00A0'}{'\u00A0'}
            {'\u00A0'}{'\u00A0'}{'\u00A0'}{'\u00A0'}{'\u00A0'}
            {'\u00A0'}{'\u00A0'}{'\u00A0'}{'\u00A0'}{'\u00A0'}
            {'\u00A0'}{'\u00A0'}{'\u00A0'}{'\u00A0'}{'\u00A0'}
            {'\u00A0'}{'\u00A0'}{'\u00A0'}{'\u00A0'}{'\u00A0'}
            {'\u00A0'}{'\u00A0'}{'\u00A0'}{'\u00A0'}{'\u00A0'}
            {'\u00A0'}{'\u00A0'}{'\u00A0'}{'\u00A0'}{'\u00A0'}
            {'\u00A0'}{'\u00A0'}{'\u00A0'}{'\u00A0'}{'\u00A0'}
            {'\u00A0'}{'\u00A0'}{'\u00A0'}{'\u00A0'}{'\u00A0'}
            {'\u00A0'}{'\u00A0'}{'\u00A0'}{'\u00A0'}{'\u00A0'}

            <span className="right">
              <button
                className="btn btn-primary btn-lg"
                onClick={e => this.handleNewPostSubmit(e)}
              >
                Done
              </button>
            </span>
        </div>
      </div>
    </div>: null
    )
  }
}
