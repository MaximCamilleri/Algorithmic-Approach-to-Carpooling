import { randomLocation } from './module.js';

var map = L.map('map').setView([35.91339549900495, 14.408547418056258], 11);
var markerList = []

var car = L.icon({
    iconUrl: 'Images/carIcon.png',
    //shadowUrl: 'leaf-shadow.png',

    iconSize:     [38, 95], // size of the icon
    shadowSize:   [50, 64], // size of the shadow
    iconAnchor:   [22, 94], // point of the icon which will correspond to marker's location
    shadowAnchor: [4, 62],  // the same for the shadow
    popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
});

L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: 'pk.eyJ1IjoibWF4aWJhciIsImEiOiJja2lka2R3Nzcxazh1MnJsYjlxYzh5bHY1In0.Oc4baw7Ru9zOkPoR7czzng'
}).addTo(map);



    

function clearMarkers(markerList, map){
    for(var i = 0; i < markerList.length; i++){
        map.removeLayer(markerList[i]);
    }
}

loc = randomLocation(36.102118268621126, 14.166972272120852, 35.7958362636939, 14.581019484501565);
    markerList.push(L.marker([loc[0], loc[1]]).addTo(map));
