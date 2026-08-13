import React, { useState } from 'react'
import {
  GoogleMap,
  LoadScript,
  Marker,
  Autocomplete,
} from '@react-google-maps/api'
import { useCallback } from 'react'
import { debounce } from 'lodash'
import { useEffect } from 'react'

const GoogleMapComponent = ({ values, setValue, isLocation = false }) => {
  const [map, setMap] = useState(null)
  const [autocomplete, setAutocomplete] = useState(null)
  const [geocoder, setGeocoder] = useState(null)

  const dohaBounds = {
    north: 25.4, // Approximate northern boundary
    south: 25.1, // Approximate southern boundary
    east: 51.64, // Approximate eastern boundary
    west: 51.44, // Approximate western boundary
  }

  const isWithinDoha = (lat, lng) => {
    return (
      lat >= dohaBounds.south &&
      lat <= dohaBounds.north &&
      lng >= dohaBounds.west &&
      lng <= dohaBounds.east
    )
  }

  const getCoordinates = () => {
    if (isLocation) {
      return {
        lat: Number(values.lat) !== 0 ? Number(values.lat) : 25.276987,
        lng: Number(values.lng) !== 0 ? Number(values.lng) : 51.520008,
      }
    }
    return {
      lat:
        values?.address?.latitude !== 0 ? values?.address?.latitude : 25.276987,
      lng:
        values?.address?.longitude !== 0
          ? values?.address?.longitude
          : 51.520008,
    }
  }

  const [markerPosition, setMarkerPosition] = useState(getCoordinates())
  const [center, setCenter] = useState(getCoordinates())
  const [inputValue, setInputValue] = useState('')
  const [debouncedValue, setDebouncedValue] = useState('')
  const [errorMessage, setErrorMessage] = useState(null)
  // Map container style
  const mapContainerStyle = {
    height: '400px',
    width: '100%',
  }

  const qatarBounds = {
    north: 26.154614, // Northernmost point
    south: 24.470901, // Southernmost point
    east: 52.638011, // Easternmost point
    west: 50.750028, // Westernmost point
  }

  const isWithinQatarBounds = (lat, lng) => {
    return (
      lat >= qatarBounds.south &&
      lat <= qatarBounds.north &&
      lng >= qatarBounds.west &&
      lng <= qatarBounds.east
    )
  }

  // Ensure Google Maps API is loaded
  const onScriptLoad = () => {
    if (window.google && window.google.maps) {
      setGeocoder(new window.google.maps.Geocoder()) // Initialize Geocoder after loading
    }
  }

  // Handle place selection from the Autocomplete
  const onPlaceSelected = useCallback(() => {
    if (autocomplete) {
      // Restrict Autocomplete to Qatar only
      autocomplete.setComponentRestrictions({ country: 'QA' })
      const place = autocomplete.getPlace()
      if (!place || !place.geometry) {
        // If no place is selected or place has no geometry
        setErrorMessage('The area should be within Qatar')
        return
      }
      if (place && place.geometry) {
        const location = place.geometry.location
        const newLat = location.lat()
        const newLng = location.lng()
        const fullAddress = place.formatted_address // Get the full address
        const addressComponents = place?.address_components
        if (!isWithinQatarBounds(newLat, newLng)) {
          setErrorMessage('The area should be within Qatar.')
          return
        } else {
          setErrorMessage('')
        }
        // Assign components to address fields
        const zone =
          addressComponents.find((component) =>
            component.types.includes('administrative_area_level_2'),
          )?.long_name || fullAddress
        const building =
          addressComponents.find(
            (component) =>
              component.types.includes('sublocality') ||
              component.types.includes('administrative_area_level_1'),
          )?.long_name || ''
        const street =
          addressComponents.find((component) =>
            component.types.includes('locality'),
          )?.long_name || ''
        const unit =
          addressComponents.find(
            (component) =>
              component.types.includes('plus_code') ||
              component.types.includes('route') ||
              component.types.includes('country'),
          )?.long_name || ''

        // Update the marker position
        setMarkerPosition({ lat: newLat, lng: newLng })
        if (isLocation) {
          setValue('zone', fullAddress)
          setValue('lat', newLat)
          setValue('lng', newLng)
          setValue('price', isWithinDoha(newLat, newLng) ? 50 : 100)
        } else {
          setValue('address.zone', zone)
          setValue('address.building', building)
          setValue('address.street', street)
          setValue('address.unit', unit)
          setValue('address.latitude', newLat)
          setValue('address.longitude', newLng)
        }
        // console.log(fullAddress)
        // Move the map to the new location
        if (map) {
          //   console.log(typeof map.panTo)
          map.panTo({ lat: newLat, lng: newLng })
          setCenter({ lat: newLat, lng: newLng })
          map.setZoom(13) // Optionally adjust the zoom level
        }
      }
    } else {
      console.error('Autocomplete is not loaded yet!')
    }
  }, [autocomplete, map, setErrorMessage, setValue])

  // Handle map click to set marker position
  const onMapClick = useCallback(
    (event) => {
      const clickedLat = event.latLng.lat()
      const clickedLng = event.latLng.lng()

      // Update the marker position to the clicked location
      setMarkerPosition({ lat: clickedLat, lng: clickedLng })

      // Use Geocoder to get the full address from latitude and longitude
      geocoder.geocode(
        { location: { lat: clickedLat, lng: clickedLng } },
        (results, status) => {
          if (status === 'OK' && results[0]) {
            const addressComponents = results[0].address_components
            // Assign components to address fields
            const zone =
              addressComponents.find((component) =>
                component.types.includes('administrative_area_level_2'),
              )?.long_name || ''
            const building =
              addressComponents.find(
                (component) =>
                  component.types.includes('sublocality') ||
                  component.types.includes('administrative_area_level_2'),
              )?.long_name || ''
            const street =
              addressComponents.find((component) =>
                component.types.includes('locality'),
              )?.long_name || ''
            const unit =
              addressComponents.find(
                (component) =>
                  component.types.includes('plus_code') ||
                  component.types.includes('route') ||
                  component.types.includes('country'),
              )?.long_name || ''

            // console.log(fullAddress)
            // Update form values
            setValue('address.zone', zone)
            setValue('address.building', building)
            setValue('address.street', street)
            setValue('address.unit', unit)
            setValue('address.latitude', clickedLat)
            setValue('address.longitude', clickedLng)
            // Move the map to the new location
            if (map) {
              map.panTo({ lat: clickedLat, lng: clickedLng })
              setCenter({ lat: clickedLat, lng: clickedLng })
            }
          } else {
            console.error('Geocoder failed due to: ' + status)
          }
        },
      )
    },
    [map, setValue, geocoder],
  )

  const debouncedSetInputValue = useCallback(
    debounce((value) => {
      setDebouncedValue(value)
    }, 300), // Adjust the debounce delay as needed (300ms is common)
    [],
  )

  // Handle input changes and debounce the value
  const handleInputChange = (e) => {
    setInputValue(e.target.value)
    debouncedSetInputValue(e.target.value)
  }

  useEffect(() => {
    if (debouncedValue) {
      // Create a new instance of AutocompleteService
      const autocompleteService = new window.google.maps.places.AutocompleteService()

      // Request place predictions
      autocompleteService.getPlacePredictions(
        { input: debouncedValue, componentRestrictions: { country: 'QA' } },
        (predictions, status) => {
          if (
            status === window.google.maps.places.PlacesServiceStatus.OK &&
            predictions.length > 0
          ) {
            setErrorMessage(null)
          } else {
            // Trigger an error if there are no predictions
            setErrorMessage('Location should be within Qatar region')
          }
        },
      )
    } else {
      setErrorMessage(null) // Reset error if input is empty
    }
  }, [debouncedValue])

  return (
    <LoadScript
      googleMapsApiKey={process.env.REACT_APP_API_KEY}
      libraries={['places', 'geocoding']}
      onLoad={onScriptLoad} // Callback when script is loaded
    >
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={13}
        options={{
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
          restriction: {
            latLngBounds: qatarBounds, // Set the bounding box for Qatar
            strictBounds: true, // Enforce strict boundaries
          },
        }}
        onLoad={(mapInstance) => setMap(mapInstance)}
        onClick={onMapClick} // Add the onClick event
      >
        {!isLocation && (
          <Autocomplete
            onLoad={(autocompleteInstance) => {
              // Set the Autocomplete instance and apply component restrictions for Qatar
              setAutocomplete(autocompleteInstance)
              autocompleteInstance.setComponentRestrictions({ country: 'QA' })
            }}
            onPlaceChanged={onPlaceSelected}
          >
            <input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              placeholder="Search location"
              style={{
                boxSizing: 'border-box',
                border: '1px solid transparent',
                width: '240px',
                height: '32px',
                padding: '0 12px',
                borderRadius: '3px',
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.3)',
                fontSize: '14px',
                outline: 'none',
                textOverflow: 'ellipses',
                position: 'absolute',
                left: '50%',
                transform: 'translateX(-50%)',
                top: '10px',
              }}
            />
          </Autocomplete>
        )}

        <Marker position={markerPosition} />

        {errorMessage && (
          <div
            style={{
              color: '#D32F2F', // A soft red color for the text
              position: 'absolute',
              top: '50px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'linear-gradient(135deg, #FFEBEE, #FFCDD2)', // Soft red gradient background
              padding: '10px 15px',
              borderRadius: '8px', // Smooth rounded corners
              boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)', // More pronounced shadow for depth
              fontSize: '14px',
              fontWeight: 'bold',
              maxWidth: '300px', // Limit width for a compact design
              textAlign: 'center', // Center-align the text
              zIndex: 1000, // Ensure it appears above other elements
              border: '1px solid #E57373', // Border to match the theme
            }}
          >
            {errorMessage}
          </div>
        )}
      </GoogleMap>
    </LoadScript>
  )
}

export default React.memo(GoogleMapComponent)
