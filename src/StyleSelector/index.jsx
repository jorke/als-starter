/* eslint-disable react/prop-types */
import { forwardRef, useRef } from 'react'
import './index.css'
import sat from './sat.png'
import globe from './globe.png'
import street from './street.png'


const StyleSelector = forwardRef(function ({handleStyleChange}, mapRef ) {

  return (
    <div className='stylewrapper'>
      
      <img src={globe} alt="Globe" onClick={() => handleStyleChange('Hybrid')}/><br />
      <img src={sat} alt="Satelite" onClick={() => handleStyleChange('Satellite')}/><br />
      <img src={street} alt="Street" onClick={() => handleStyleChange('Monochrome')} />
    </div>
  )
})

export default StyleSelector


