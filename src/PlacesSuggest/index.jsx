import React, { useState, useEffect, useCallback } from 'react';
import { Accordion, Autocomplete, Flex, TextField, SearchField, Table, TableCell, TableRow, Button, HighlightMatch, Link} from '@aws-amplify/ui-react';

import './index.css'
// Custom debounce hook
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
};

/* 
https://docs.aws.amazon.com/location/latest/APIReference/API_geoplaces_Suggest.html

{
   "AdditionalFeatures": [ "string" ],
   "BiasPosition": [ number ],
   "Filter": { 
      "BoundingBox": [ number ],
      "Circle": { 
         "Center": [ number ],
         "Radius": number
      },
      "IncludeCountries": [ "string" ]
   },
   "IntendedUse": "string",
   "Language": "string",
   "MaxQueryRefinements": number,
   "MaxResults": number,
   "PoliticalView": "string",
   "QueryText": "string"
}
*/

const PlacesSuggest = ({ apiKey, region, BoundingBox, onSelect, onSearchData }) => {
  const [searchOptions, setSearchOptions] = useState({
    "AdditionalFeatures": ["Core"],
    // "BiasPosition": [ 151.180, -33.87 ],
    "Filter": {
      "BoundingBox": BoundingBox,
      //  "Circle": {
      //     "Center": [ 151.180, -33.87 ],
      //     "Radius": 100
      //  },
      "IncludeCountries": ["AUS"],
      //  "IncludePlaceTypes": [ "Locality"]
    },
    "IntendedUse": "SingleUse",
    // "Language": "en",
    "MaxQueryRefinements": 5,
    "MaxResults": 50,
    // "PoliticalView": "string",
    // "QueryText": "string"
  })
  const [searchText, setSearchText] = useState('');
  const [options, setOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [place, setPlace] = useState()
  
  // Debounce the search text
  const debouncedSearchText = useDebounce(searchText, 250);

  const searchPlaces = useCallback(async (text) => {
    if (text.length < 5) {
      setOptions([]);
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(
        `https://places.geo.${region}.amazonaws.com/v2/suggest?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            QueryText: text,
            ...searchOptions
          }),
        }
      );

      const data = await response.json();
      console.log('>>>', data)
      const suggestions = data.ResultItems.map(result => ({
        id: result.Place.PlaceId,
        label: result.Title,
        value: result.Place.PlaceId,
        place: result.Place,
      }));
      console.log(suggestions)
      
      setOptions(suggestions);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setOptions([]);
    } finally {
      setIsLoading(false);
    }
  }, [apiKey, region]);

  const getPlaceId = useCallback(async (placeId) => {
    const response = await fetch(`https://places.geo.${region}.amazonaws.com/v2/place/${placeId}?key=${apiKey}`)
    const data = await response.json()
    setPlace(data)
    return data
  },[apiKey, region])

  // Effect to trigger search when debounced text changes
  useEffect(() => {
    searchPlaces(debouncedSearchText);
  }, [debouncedSearchText, searchPlaces]);

  useEffect(() => {
    onSelect(place)
  }, [place])

  useEffect(() => {
    if (options.length === 0) { 
      onSearchData([]) 
    } else { 
      onSearchData(options.map(p => ({
        Place: p.place, Position: p.place.Position
      })))
    }
  }, [options])

  const searchChange = (event) => setSearchText(event.target.value);

  const handleSelect = (option) => getPlaceId(option.id)

  const optionFilter = (option, value) => <HighlightMatch query={value}>{option.label}</HighlightMatch>

  const renderOption = (option, value) => {
    const { id, label, place} = option
    return <span>{label}</span>   
  }

  return (
    <Flex direction="column" className="searchbox">
      <Link
        href="https://docs.aws.amazon.com/location/latest/APIReference/API_geoplaces_Suggest.html"
        isExternal={true}
      >Amazon Location Service Suggest API</Link>

      <Autocomplete
        label="Search location"
        placeholder="Type at least 5 characters..."
        options={options}
        onChange={searchChange}
        optionFilter={optionFilter}
        // onClick={() => console.log('hi')}
        onSelect={handleSelect}
        onClear={() => setOptions([])}
        isLoading={isLoading}
        renderOption={renderOption}
        // placeholder="Searching..."
        // errorMessage="Error loading suggestions"
        size="large"
      />
      <Accordion.Container>
        <Accordion.Item value="searchoptions">
          <Accordion.Trigger>Search Options<Accordion.Icon /></Accordion.Trigger>
          <Accordion.Content>
            <TextField
              label="MaxResults"
              type="number"
              value={searchOptions.MaxResults}
              onChange={(e) =>
                setSearchOptions(prev => ({
                  ...prev,
                  MaxResults: parseInt(e.target.value, 10)
                }))
              }
              min={1}
              max={20}
            />
            <TextField
              label="Filter.BoundingBox"
              type="text"
              value={searchOptions.Filter.BoundingBox}
              isDisabled
            />
            <TextField
              label="AdditionalFeatures"
              type="text"
              value={searchOptions.AdditionalFeatures}
              isDisabled
            />
            <TextField
              label="MaxQueryRefinements"
              type="number"
              value={searchOptions.MaxQueryRefinements}
              onChange={(e) =>
                setSearchOptions(prev => ({
                  ...prev,
                  MaxQueryRefinements: parseInt(e.target.value, 10)
                }))
              }
              min={1}
              max={10}
            />


            
          </Accordion.Content>
        </Accordion.Item>
      </Accordion.Container>
    </Flex>
  );
};

export default PlacesSuggest;
