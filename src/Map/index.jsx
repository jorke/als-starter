import React, { useState, useRef } from 'react'
import MapGL, {
  NavigationControl,
  GeolocateControl,
} from '@vis.gl/react-maplibre'
import 'maplibre-gl/dist/maplibre-gl.css'
import './index.css'
import LatLonBox from '../LatLonBox'

const apiKey = process.env.APIKEY || ''
const defaultMapStyle = process.env.DEFAULT_MAPSTYLE || 'heresat'
const region = process.env.REGION || ''

const Map = () => {
  const [viewport, setViewport] = useState({
    latitude: -33.875,
    longitude: 151.205,
    zoom: 1,
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
          width="100vw"
          height="100vh"
          mapStyle={`https://maps.geo.${region}.amazonaws.com/maps/v0/maps/${defaultMapStyle}/style-descriptor?key=${apiKey}`}
          onMouseMove={(m) =>setLngLat(m.lngLat)}
          tileSize={512}
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
        <button onClick={() => mapRef.current.getMap().setProjection({type: 'globe'})}>Globe</button>
      </>
    :
      <h1>check your env variables for APIKEY, DEFAULT_MAPSTYLE, and REGION respectively. 
        You can also check the README for more details.
      </h1>
  )
}

export default Map
