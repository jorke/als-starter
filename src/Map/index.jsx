import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import MapGL, {
  NavigationControl,
  GeolocateControl,
  Source,
  Layer,
  Marker,
  MapProvider
} from 'react-map-gl/maplibre'
import 'maplibre-gl/dist/maplibre-gl.css'
import {bboxPolygon } from "@turf/bbox-polygon"
import './index.css'
import Pin from '../Pin'
import LatLonBox from '../LatLonBox'
import StyleSelector from '../StyleSelector'
import PlacesSuggest from '../PlacesSuggest'
import PlaceTable from '../Place'

const apiKey = process.env.APIKEY || ''
const defaultMapStyle = process.env.DEFAULT_MAPSTYLE || 'Monochrome' //Standard, Monochrome, Hybrid, Satellite
const region = process.env.REGION || ''
const colorScheme = 'Light'

const Map = () => {
  const [mapStyle, setMapStyle] = useState(defaultMapStyle)
  const [marker, setMarker] = useState()
  const [place, setPlace] = useState()
  const [viewport, setViewport] = useState({
    latitude: -25.528,
    longitude: 135.365,
    zoom: 4,
  })
  const [boundingBox, setBoundingBox] = useState(
    [
      112.60532385572196, -44.009791651340684,
      154.4992789661676, -9.925413000595569
    ]
  )
  
  const [search, setSearch] = useState([])
  const [hoverInfo, setHoverInfo] = useState(null)

  const boundingBoxJSON = useMemo(() => bboxPolygon(boundingBox), [boundingBox])

  const searchGeoJSON = useMemo(() => { 
    return {
      type: 'FeatureCollection',
      features: search.map( s => ({
        type: 'Feature',
        properties: {
          Place: s.Place
        },
        geometry: {
          coordinates: [s.Position[0], s.Position[1]],
          type: 'Point',
        }
      }))
    }
  }, [search])

  const onHover = useCallback(e => {
    // console.log(e)
    const { features, point: { x, y } } = e
    
    const hoveredFeature = features && features[0]
    setHoverInfo(hoveredFeature && { feature: hoveredFeature, x, y });
  }, [])

  const featureClick = useCallback(event => {
    const { features, point: { x, y } } = event
    const clickedFeatures = features && features[0]
    if (!clickedFeatures) return
    const cleaned = JSON.parse(clickedFeatures.properties.Place)
    navigator.clipboard.writeText(JSON.stringify(cleaned, null, 2))
  })
  
  const [lngLat, setLngLat] = useState({ lat: viewport.latitude, lng: viewport.longitude})

  const mapRef = useRef()
  const handleSelect = (fullResult) => {  
    if (!fullResult) return
    const { PlaceId, Title, Position: [ lng, lat ] } = fullResult
    const place = { PlaceId, Title, lng, lat }
    setPlace(fullResult)
    setMarker({lng, lat})
    mapRef.current.flyTo({ center: [lng, lat], zoom: 19 })
    console.log(place)
  }

  const onSearchData = data => setSearch(data)

  const handleStyleChange = (style) => {
    setMapStyle(style)
  }

  return (
    (apiKey && defaultMapStyle && region) ?
      <MapProvider>
        <PlacesSuggest 
          apiKey={apiKey} 
          region={region} 
          onSelect={handleSelect} 
          onSearchData={onSearchData} 
          BoundingBox={boundingBox}
          
          />
          <MapGL
            initialViewState={viewport}
            ref={mapRef}
            onViewportChange={(v) => setViewport(v)}
            mapStyle={`https://maps.geo.${region}.amazonaws.com/v2/styles/${mapStyle}/descriptor?color-scheme=${colorScheme}&key=${apiKey}`}
            interactiveLayerIds={['search-data-layer']}
            onMouseMove={(m) => { 
              setLngLat(m.lngLat);
              onHover(m)
            }}
            tileSize={512}
            projection={{ type: 'mercator' }}
            onClick={featureClick}
          >
          {marker && <Marker
            longitude={marker.lng}
            latitude={marker.lat}
            anchor="bottom"
            onClick={e => e.originalEvent.stopPropagation()}
          >
            <Pin />
          </Marker>}
          <Source id="bbox-source" type="geojson" data={boundingBoxJSON}>
            <Layer 
              source="bbox-source"
              id="bbox-layer"
              type="fill"
              paint={{
                'fill-color': 'rgb(255, 255, 255, 0.1)'
              }}
            />
          </Source>
          <Source id="search-data" type="geojson" data={searchGeoJSON}>
            <Layer type="circle"
              source="search-data"
              id="search-data-layer"
              paint={{
                'circle-radius': 5,
                'circle-color': 'rgb(255, 0, 0, 1)'
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
          {hoverInfo && (
            <div className="tooltip" style={{ left: hoverInfo.x+10, top: hoverInfo.y-5, position: 'fixed' }}>
              <PlaceTable place={JSON.parse(hoverInfo.feature.properties.Place)} />
            </div>
          )}
          </MapGL>        
        <LatLonBox data={lngLat} />
        <StyleSelector ref={mapRef} handleStyleChange={handleStyleChange} />
      </MapProvider>
    :
      <h1>check your env variables for APIKEY, DEFAULT_MAPSTYLE, and REGION respectively. 
        You can also check the README for more details.
      </h1>
  )
}

export default Map
