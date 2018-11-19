import React, { Component } from 'react'

export default class ListPopup extends Component {
  constructor(props) {
  	super(props)
  }

  componentDidMount() {
    var overlay = document.getElementById("overlay");
    //Set a variable to contain the DOM element of the popup
    var popup = document.getElementById("popup");

    //Changing the display css style from none to block will make it visible
    overlay.style.display = "block";
    //Same goes for the popup
    popup.style.display = "block";
  }

  componentWillUnmount() {
    var overlay = document.getElementById("overlay");
    //Set a variable to contain the DOM element of the popup
    var popup = document.getElementById("popup");

    //Changing the display css style from none to block will make it visible
    overlay.style.display = "none";
    //Same goes for the popup
    popup.style.display = "none";
  }

  close(e) {
    e.preventDefault()
    this.props.closePopup()
  }

  add(i) {
    alert("Added!")
    this.props.add(i)
  }

  render() {
    return (
      <div>
        <div id="overlay"></div>
        <div id="popup">
          {this.props.playlists.map((list, i) => (
                <div key={i}>
                  <input type='button'
                         className="save-button"
                         onClick={() => this.add(i)}
                         value="+"/>
                  {'\u00A0'}{'\u00A0'}{'\u00A0'}{'\u00A0'}{'\u00A0'}{'\u00A0'}{'\u00A0'}{'\u00A0'}
                  {list}
                </div>
              )
          )}
          <br />
           <span className="right">
               <button
                 className="btn btn-primary btn-lg"
                 onClick={e => this.close(e)}
               >
                 Done
               </button>
           </span>
        </div>
      </div>
    )
  }
}
