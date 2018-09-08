import Dropzone from 'react-dropzone'
import React, { Component } from 'react'

const dropzoneStyle = {
    width  : "95%",
    height: '200px',
    border: '5px dotted #747474',
    margin: '0 0 15px 15px',
    padding: '12px'
};

export default class Accept extends React.Component {
  constructor() {
    super()
    this.state = {
      accepted: [],
      rejected: []
    }
    this.handleDrop = this.handleDrop.bind(this)
  }

  handleDrop(accepted, rejected) {
    this.setState({ accepted, rejected }, this.props.onAccept(accepted))
  }

  render() {
    return (
          <div className="dropzone">
            <Dropzone
              accept="audio/*"
              onDrop={(accepted, rejected) => { this.handleDrop(accepted, rejected) }}
              style={dropzoneStyle}
            >
              <aside>
                <p>Drop an audio file here or click to select</p>
                <ul>
                  {
                    this.state.accepted.map(f => <li key={f.name}>{f.name}</li>)
                  }
                </ul>
              </aside>
            </Dropzone>
          </div>
    )
  }
}
