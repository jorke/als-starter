import React from 'react'
import './index.css'

export default props => {
  const {lat, lng } = props.data
  return (
    <div className='wrapper'>
      <fieldset>
        <code>
          lat: {lat}<br />
          lng: {lng}
        </code>
      </fieldset>
    </div>
  )
}