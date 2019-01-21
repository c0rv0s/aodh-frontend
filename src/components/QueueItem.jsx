import React, { Component } from 'react'
import { Link } from 'react-router-dom'

export default class QueueItem extends Component {
  constructor(props) {
  	super(props)
  }

  render() {
    const item = this.props.item
    return (
      <div>
        <br/>
        {this.props.id != 0 &&
          <i className="fas fa-play-circle pointer"
             onClick={() => this.props.play(this.props.id)}></i>
        }
        {'\u00A0'}{'\u00A0'}
        <Link to={'/'+item.op+'/'+item.title} >
          {item.title}
        </Link>
        {'\u00A0'}by{'\u00A0'}
        <Link to={'/'+item.op} className="blackText solarbrown">{item.op.split('.')[0]}</Link>
        {'\u00A0'}{'\u00A0'}
        {this.props.id != 0 &&
          <i className="fas fa-times pointer"
             onClick={() => this.props.remove(this.props.id)}></i>
        }
        <br/>
      </div>
    )
  }

}
