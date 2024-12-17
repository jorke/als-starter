import React, { useState, useRef, useEffect } from 'react'
import MapGL, {
  NavigationControl,
  GeolocateControl,
  Source,
  Layer,
} from '@vis.gl/react-maplibre'
import maplibregl from 'maplibre-gl'

import 'maplibre-gl/dist/maplibre-gl.css'
import './index.css'
import LatLonBox from '../LatLonBox'
import StyleSelector from '../StyleSelector'

const apiKey = process.env.APIKEY || ''
const defaultMapStyle = process.env.DEFAULT_MAPSTYLE || 'Hybrid'
const region = process.env.REGION || ''
const colorScheme = 'Light'

const Map = () => {
  const [viewport, setViewport] = useState({
    latitude: -33.875,
    longitude: 151.205,
    zoom: 5,
  })

  const [lngLat, setLngLat] = useState({ lat: viewport.latitude, lng: viewport.longitude})

  const mapRef = useRef()

  return (
    (apiKey && defaultMapStyle && region) ?
      <>
        <MapGL
          initialViewState={viewport} 
          ref={mapRef}
          onViewportChange={(v) => setViewport(v)}
          mapStyle={`https://maps.geo.${region}.amazonaws.com/v2/styles/${defaultMapStyle}/descriptor?color-scheme=${colorScheme}&key=${apiKey}`}
          onMouseMove={(m) =>setLngLat(m.lngLat)}
          tileSize={512}
          projection={{ type: 'mercator'}}
          mapLib={maplibregl}
        >
          <GeolocateControl
            style={{ right: 10, bottom: 85 }}
            positionOptions={{ enableHighAccuracy: true }}
            trackUserLocation
            auto={false}
          />
          <NavigationControl
              style={{ right: 10, bottom: 20 }}
              showCompass={false}
            />
        </MapGL>
        <LatLonBox data={lngLat} />
        <StyleSelector ref={mapRef} />
      </>
    :
      <h1>check your env variables for APIKEY, DEFAULT_MAPSTYLE, and REGION respectively. 
        You can also check the README for more details.
      </h1>
  )
}

export default Map
