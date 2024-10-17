/* eslint-disable react/prop-types */
import { forwardRef, useRef } from 'react'
import './index.css'
import sat from './sat.png'
import globe from './globe.png'
import street from './street.png'

const StyleSelector = forwardRef(function( props, mapRef ) {
  return (
    <div className='stylewrapper'>
      <img src={globe} alt="Globe" onClick={() => mapRef.current.getMap().setProjection({type: 'globe'})}/><br />
      <img src={street} alt="Street View" onClick={() => mapRef.current.getMap().setProjection({ type: 'mercator' })} /><br />
      {/* <img src={sat} alt="Satellite View" onClick={() => mapRef.current.getMap().setProjection({ type: 'mercator' })} /> */}
    </div>
  )
})

export default StyleSelector


