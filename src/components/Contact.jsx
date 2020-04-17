import React, { Component } from 'react'

export default class Contact extends Component {


  handleSubmit(e){
        e.preventDefault();
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const message = document.getElementById('message').value;

        let data = {
          name: name,
          email: email,
          message: message
        }
        var request = new Request('https://aodh.xyz/api/contact', {
          method: 'POST',
          headers: new Headers({'Content-Type': 'application/json'}),
          body: JSON.stringify(data)
        })

        fetch(request)
        .then((response) => {
          alert("Your message has been successfully sent!")
          document.getElementById('contact-form').reset();

        })
        .catch((err) => {
          console.log(err);
        })
    }

  render() {

    return (
      <div className="container">
        <div className="row">
          <div className="col-md-offset-3 col-md-6">
            <h1>Contact</h1>
            <br/><br/>
            <p>You can reach Aodh with the following form: </p>

            <form id="contact-form" onSubmit={this.handleSubmit.bind(this)} method="POST">
              <div className="form-group">
                  <label htmlFor="name">Name</label>
                  <input type="text" className="form-control" id="name" />
              </div>
              <div className="form-group">
                  <label htmlFor="exampleInputEmail1">Email address</label>
                  <input type="email" className="form-control" id="email" aria-describedby="emailHelp" />
              </div>
              <div className="form-group">
                  <label htmlFor="message">Message</label>
                  <textarea className="form-control" rows="5" id="message"></textarea>
              </div>
              <button type="submit" className="btn btn-primary btn-lg">Submit</button>
          </form>

          </div>
        </div>
      </div>
    )
  }
}
