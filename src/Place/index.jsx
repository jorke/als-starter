import { Flex, Table, TableCell, TableBody, TableHead, TableRow } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import './index.css'

const flattenObject = (obj, prefix = '') => {
  return Object.keys(obj).reduce((acc, key) => {
    const pre = prefix.length ? prefix + '.' : '';

    if (Array.isArray(obj[key])) {
      // Handle arrays by keeping them as is
      acc[pre + key] = obj[key];
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      // Recursively flatten nested objects
      Object.assign(acc, flattenObject(obj[key], pre + key));
    } else {
      // Add non-object values directly
      acc[pre + key] = obj[key];
    }

    return acc;
  }, {});
}

const PlaceTable = ({ place }) => {

  const data = flattenObject(place)

  const formatValue = (value) => {
    if (Array.isArray(value)) {
      return JSON.stringify(value);
    }
    if (typeof value === 'object' && value !== null) {
      return JSON.stringify(value);
    }
    return value;
  };

  return (
    <table className='placetable'>
      <tbody>
        {Object.entries(data).map(([key, value]) => (
          <tr key={key}>
            <td>{key}</td>
            <td>{formatValue(value)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
  // ;</table>
  //     <Table className='custom-table' size='small' 
  //     // highlightOnHover={true}
  //     >
  //       <TableHead>
  //         <TableRow>
  //           <TableCell as="th">Property</TableCell>
  //           <TableCell style={{ maxWidth: '10vw'}} as="th">Value</TableCell>
  //         </TableRow>
  //       </TableHead>
  //       <TableBody>
  //         {Object.entries(data).map(([key, value]) => (
  //           <TableRow key={key}>
  //             <TableCell>{key}</TableCell>
  //             <TableCell style={{ overflow: 'hidden' }}>{formatValue(value)}</TableCell>
  //           </TableRow>
  //         ))}
  //       </TableBody>
  //     </Table>
    
  // );
}

export default PlaceTable;
// // Usage:
// function App() {
//   const placeData = {
//     "PlaceId": "AQAAA...",
//     "PlaceType": "PointAddress",
//     // ... your JSON data
//   };

//   return (
//     <div style={{ padding: '20px' }}>
//       <PlaceTable data={placeData} />
//     </div>
//   );
// }

// export default App;


/* example json input

{
  "PlaceId": "AQAAAGAAMZgZuXV1z9wjrFEqaD5F4pQp-HitXJuQXBO0zsNmWfCHT1B-hT4EAuf5kYTo11xryX59JgSvlUSesVqkiFalX_PSv0yV9Nk9kJvBO3MXwqQqQNIcW3B5BgCq-qkn1hD-OldOYS4_2x7swnRg7f0PMYniwT8Gz6nFnP5Eh75A_G8",
    "PlaceType": "PointAddress",
      "Title": "32 Hartley St, Rozelle NSW 2039, Australia",
        "Address": {
    "Label": "32 Hartley St, Rozelle NSW 2039, Australia",
      "Country": {
      "Code2": "AU",
        "Code3": "AUS",
          "Name": "Australia"
    },
    "Region": {
      "Code": "NSW",
        "Name": "New South Wales"
    },
    "Locality": "Sydney",
      "District": "Rozelle",
        "PostalCode": "2039",
          "Street": "Hartley St",
            "StreetComponents": [
              {
                "BaseName": "Hartley",
                "Type": "St",
                "TypePlacement": "AfterBaseName",
                "TypeSeparator": " ",
                "Language": "en"
              }
            ],
              "AddressNumber": "32"
  },
  "Position": [
    151.17371,
    -33.86552
  ],
    "MapView": [
      151.1733,
      -33.86598,
      151.1743,
      -33.86402
    ]
}
    */





// {
// "PlaceId": "AQAAA...",
// "PlaceType": "PointAddress",
// "Title": "32 Hartley St, Rozelle NSW 2039, Australia",
// "Address.Label": "32 Hartley St, Rozelle NSW 2039, Australia",
// "Address.Country.Code2": "AU",
// "Address.Country.Code3": "AUS",
// "Address.Country.Name": "Australia",
// "Address.Region.Code": "NSW",
// "Address.Region.Name": "New South Wales",
// "Address.Locality": "Sydney",
// "Address.District": "Rozelle",
// "Address.PostalCode": "2039",
// "Address.Street": "Hartley St",
// "Address.StreetComponents": [{ ...}], // Array remains as is
// "Address.AddressNumber": "32",
// "Position": [151.17371, -33.86552],
// "MapView": [151.1733, -33.86598, 151.1743, -33.86402]
// }
