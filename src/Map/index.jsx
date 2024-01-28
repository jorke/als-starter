import React, { useState, useRef } from 'react'
import MapGL, {
  NavigationControl,
  GeolocateControl,
  Source,
  Layer
} from 'react-map-gl/maplibre'
import 'maplibre-gl/dist/maplibre-gl.css'
import './index.css'
import LatLonBox from '../LatLonBox'

const apiKey = process.env.APIKEY || ''
const defaultMapStyle = process.env.DEFAULT_MAPSTYLE || 'satmap'
const region = process.env.REGION || ''

const Map = () => {
  const [viewport, setViewport] = useState({
    latitude: -33.875,
    longitude: 151.205,
    zoom: 13,
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
          // terrain={{
          //   source: "mapzen-dem",
          //   exaggeration: 2 ,
          // }}
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
          <Source
            id="raster-dem"
            type="raster-dem"
            tiles={[
              "https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png"
            ]}
            // url="https://s3.amazonaws.com/elevation-tiles-prod/normal/{z}/{x}/{y}.png"
            // url="https://demotiles.maplibre.org/terrain-tiles/tiles.json"
            tileSize={512}
            encoding="terrarium"
            
          >
            {/* <Layer source="raster-dem" id="raster-layer" type="raster" /> */}
          </Source>
          <Source 
            id="wms"
            type="raster"
            tiles={[
              "https://services.ga.gov.au/gis/great-artesian-basin/wms?bbox={bbox-epsg-3857}&format=image/png&service=WMS&version=1.1.1&request=GetMap&srs=EPSG:3857&width=256&height=256&layers=gab:CAD-HOOR_TDS"
            ]}>
              <Layer source="wms" id="wms-layer" type="raster" paint={{ "raster-opacity": 0.4 }} />
          </Source> 
        </MapGL>
        <LatLonBox data={lngLat} />
      </>
    :
      <h1>check your env variables for APIKEY, DEFAULT_MAPSTYLE, and REGION respectively. 
        You can also check the README for more details.
      </h1>
  )
}

export default Map
