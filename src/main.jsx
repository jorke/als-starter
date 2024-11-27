import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import '@aws-amplify/ui-react/styles.css';
import Map from './Map'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Map />
  </React.StrictMode>,
)
