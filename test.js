var platform = new H.service.Platform({
    'apikey': '{LQwxTMdnQrVjDOvLzKdImw}'
  });

// Instantiate (and display) a map object:
var map = new H.Map(
document.getElementById('map'),
defaultLayers.vector.normal.map,
{
    zoom: 10,
    center: { lat: 52.5, lng: 13.4 }
});


// let feature;
// if (response.geometries.length > 0) {
//     feature = response.geometries[0].attributes.FEATURE_TYPE;

//     if (features.includes(feature)) {
//         isWater = true;
//         let featureNames = response.geometries[0].attributes.NAMES;
//         featureName = featureNames.substring(5, featureNames.length);
//         let separator = '\u001E';
//         let index = featureName.indexOf(separator);

//         if (index != -1) {
//             featureName = featureName.substring(0, index);
//         }

//     } else {
//         isWater = false;
//     }

// } else {
//     isWater = false;
// }
