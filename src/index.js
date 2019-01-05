import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter } from 'react-router-dom'

import App from './components/App.jsx'

// Require Sass file so webpack can build it
import bootstrap from 'bootstrap/dist/css/bootstrap.css'
import style from './styles/style.css'
import style2 from './styles/dark.css'

document.styleSheets[3].disabled = true

ReactDOM.render(<BrowserRouter>
                  <App />
                </BrowserRouter>,
                 document.getElementById('root')
 )
