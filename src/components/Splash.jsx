import React, { Component } from 'react'
import Signin from './Signin.jsx'

export default class Splash extends Component {

  componentDidMount() {
    // var canvas = document.createElement('canvas'),
    var canvas = document.getElementById('canvas'),
    ctx = canvas.getContext('2d'),
    width = canvas.width = 400,
    halfWidth = width / 2,
    height = canvas.height = 400,
    halfHeight = height / 2;

document.body.appendChild(canvas);

var lineCount = 40,
    color = '#6EB4CB',
    offset = Math.PI * 3.5;

ctx.shadowBlur = 10;
ctx.shadowColor = color;
ctx.fillStyle = color;

/*////////////////////////////////////////*/

function Line(pos){ this.pos = pos; }

Line.prototype = {
  constructor: Line,
  pos: 0,
  width: halfWidth,
  height: 4,
  range: halfHeight * 0.9,

  render: function(ctx, delta){

    var pos = this.pos;//Math.sin(delta + (this.pos*Math.PI));// * ( delta < Math.PI ? Math.sin(delta * 0.5) : 1);//Math.abs( Math.sin( delta + this.pos) ) ;

    var minWidth = (this.width * 0.25)
    var lineWidth = minWidth + (this.width * 0.75 * pos);
    var lineHeight = Math.cos(delta + (pos * offset)) * this.height;
    var x = ( width - minWidth ) * (1 - pos);
    var y =
      ( Math.sin( delta + (pos * offset) )
      * ( this.range/2 + this.range/2 * ( pos )) )
      + halfHeight;

    ctx.globalAlpha = 0.3 + (0.65 * ( 1 - pos));
    ctx.beginPath();
    ctx.rect(x, y, lineWidth, lineHeight);
    ctx.closePath();
    ctx.fill();
  }
}

var lines = [];

for ( var i = 0; i < lineCount; i++) {
  lines.push( new Line( i / lineCount )  );
}

var wave = 0;
function render(){
  requestAnimationFrame(render);
  wave += 0.02;
  ctx.clearRect(0, 0, width, height);
  lines.forEach(function(line){ line.render(ctx, wave); });
}

render();
  }

  signin() {
    var x = document.getElementById("canvas");
    x.remove(x.selectedIndex);
  }

  render() {
    return (
      <div>
      <header className="masthead">
        <div className="container h-100">
          <div className="row h-100">
            <div className="col-lg-7 my-auto">
              <div className="header-content mx-auto">
                <h1 className="mb-5">Aodh is a first of its kind decentralized streaming platform that puts you in control of your music</h1>
                <div className="button" onClick={this.signin} >
                  <br/><br/>
                  <Signin handleSignIn={ this.props.handleSignIn } />
                </div>
              </div>
            </div>
            <div className="col-lg-5 my-auto">

              <canvas id="canvas" />

            </div>
          </div>
        </div>

      </header>

      <section className="features" id="features">
        <div className="container">
          <div className="section-heading text-center">
            <h2>What? How? Why?</h2>
            <hr/>
          </div>
          <div className="row">
            <div className="col-lg-4 my-auto">
              <div className="device-container">
                <div className="device-mockup iphone6_plus portrait white">
                  <div className="screen">
                    <img src="http://i63.tinypic.com/vctheo.png" class="img-fluid" width="375" alt="" />
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-8 my-auto">
              <div className="container-fluid">
                <div className="row">
                  <div className="col-lg-6">
                    <div className="feature-item">
                      <i className="icon-screen-smartphone text-primary"></i>
                      <h3>Free</h3>
                      <p>Everything you post is saved and delivered through the Blockstack network.
                        Post as much as you want forever, no data harvesting, you aren't the product,
                        your music is and you are the owner.
                      </p>
                    </div>
                  </div>
                  <div className="col-lg-6">
                    <div className="feature-item">
                      <i className="icon-camera text-primary"></i>
                      <h3>Secure</h3>
                      <p>Only your private key unlocks your account. Set your permissions and
                        control your data.</p>
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-lg-6">
                    <div className="feature-item">
                      <i className="icon-lock-open text-primary"></i>
                      <h3>How do I use Aodh?</h3>
                      <p>First you need to download the
                        <a href="https://blockstack.org/install/"> Blockstack Browser </a>at blockstack.org
                       to access the decentralized internet and be able to use apps like Aodh.</p>
                    </div>
                  </div>
                  <div className="col-lg-6">
                    <div className="feature-item">
                      <i className="icon-lock-open text-primary"></i>
                      <h3>Coming Soon: Monetization</h3>
                      <p>You put your life into your music. Let your music pay for your life.
                        <a href="https://airtext.xyz/blog/c0rv0s69.id.blockstack"> Check for updates on the blog.</a> </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="cta">
        <div className="cta-content">
          <div className="container">
            <h2>Get Started Now.</h2>
              <div className="button" onClick={this.signin} >
                <br/><br/>
                <Signin handleSignIn={ this.props.handleSignIn } />
              </div>
          </div>
        </div>
        <div className="overlay"></div>
      </section>

      <footer>
        <div className="container">
          <p>&copy; Aodh 2018. All Rights Reserved.</p>
          <p>Animation by <a href="https://codepen.io/shshaw/">Shaw</a> on CodePen</p>
          <p><a href="https://airtext.xyz/blog/c0rv0s69.id.blockstack">About/Blog</a></p>
        </div>
      </footer>
      </div>
    )
  }

}
