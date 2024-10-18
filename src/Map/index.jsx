import React, { useState, useRef, useEffect } from 'react'
import MapGL, {
  NavigationControl,
  GeolocateControl,
  Source,
  Layer,
} from '@vis.gl/react-maplibre'
import maplibregl from 'maplibre-gl'
import * as pmtiles from 'pmtiles'

import 'maplibre-gl/dist/maplibre-gl.css'
import './index.css'
import LatLonBox from '../LatLonBox'
import StyleSelector from '../StyleSelector'

const apiKey = process.env.APIKEY || ''
const defaultMapStyle = process.env.DEFAULT_MAPSTYLE || 'here_hybrid'
const region = process.env.REGION || ''

const Map = () => {

  const [pmTilesReady, setPmTilesReady] = useState(false)
  
  const [viewport, setViewport] = useState({
    latitude: -33.875,
    longitude: 151.205,
    zoom: 5,
  })

  useEffect(() => {
    const protocol = new pmtiles.Protocol({metadata: true})
    maplibregl.addProtocol('pmtiles', protocol.tile)
    setPmTilesReady(true)
    
    return () => {
      maplibregl.removeProtocol('pmtiles')
    }

  }, [])

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
          mapStyle={pmTilesReady ? `https://maps.geo.${region}.amazonaws.com/maps/v0/maps/${defaultMapStyle}/style-descriptor?key=${apiKey}` : undefined}
          onMouseMove={(m) =>setLngLat(m.lngLat)}
          tileSize={512}
          projection={{ type: 'mercator'}}
          mapLib={maplibregl}
        >
          <Source id="pmtiles" type="vector" url="pmtiles://https://d1firxt62yjjug.cloudfront.net/pmtiles/nsw_lga.pmtiles"> 
            <Layer id="pmtiles-lines" source="pmtiles" type="line" source-layer="nswlgaboundaries"
              paint={{
                "line-color": "red",
                "line-width": 2
              }}
            />
          </Source>
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
