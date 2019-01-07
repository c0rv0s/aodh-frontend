import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter } from 'react-router-dom'

import App from './components/App.jsx'

// Require Sass file so webpack can build it
import fontawesome from './styles/fontawesome.css'
import solid from './styles/solid.css'
import bootstrap from 'bootstrap/dist/css/bootstrap.css'
import style from './styles/style.css'
import dark from './styles/dark.css'
import solaris from './styles/solar.css'
import hypersonic from './styles/hypersonic.css'

document.styleSheets[4].disabled = true
document.styleSheets[5].disabled = true
document.styleSheets[6].disabled = true

ReactDOM.render(<BrowserRouter>
                  <App />
                </BrowserRouter>,
                 document.getElementById('root')
 )
