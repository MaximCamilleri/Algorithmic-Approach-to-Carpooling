// Creating the map
var map = L.map('map').setView([35.91339549900495, 14.408547418056258], 11);

L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: 'pk.eyJ1IjoibWF4aWJhciIsImEiOiJja2lka2R3Nzcxazh1MnJsYjlxYzh5bHY1In0.Oc4baw7Ru9zOkPoR7czzng'
}).addTo(map);


// Creating map icon presets 
var car = L.icon({
    iconUrl: 'Images/carIcon.png',
    //shadowUrl: 'leaf-shadow.png',

    iconSize:     [38, 95], // size of the icon
    shadowSize:   [50, 64], // size of the shadow
    iconAnchor:   [22, 94], // point of the icon which will correspond to marker's location
    shadowAnchor: [4, 62],  // the same for the shadow
    popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
});



var cars = new Array();
polyPoints = new Array();

function moveCar(){
    cars[0].start();
}

function getCars(){
    var value = JSON.parse($.ajax({ 
        url: '/getCars', 
        async: false
     }).responseText);
     for(var i = 0; i < value.length; i++){
         console.log(polyPoints[0][0])
        var marker = L.Marker.movingMarker(polyPoints, [500] * 100, {
            autostart: false
        });
        map.addLayer(marker);
        console.log(marker._leaflet_id);
        cars.push(marker);
    }
}

function getStartPoints(){
    var value = JSON.parse($.ajax({ 
        url: '/getStartPoints', 
        async: false
     }).responseText);
     for(var i = 0; i < value.length; i++){
        var marker = new L.Marker(value[i]).addTo(map);
    }
}

function getEndPoints(){
    var value = JSON.parse($.ajax({ 
        url: '/getEndPoints', 
        async: false
     }).responseText);
     for(var i = 0; i < value.length; i++){
         console.log(value[i])
        var marker = new L.Marker(value[i]).addTo(map);
    }
}

function getPolyline(){
    polyPoints = [];
    var value = JSON.parse($.ajax({ 
        url: '/getPolyline', 
        async: false
     }).responseText);
     for(var i = 0; i < value.length; i++){
        var l = polyline.decode(value[i])
        L.polyline(l, {color: 'red'}).addTo(map);
        for(var j = 0; j < l.length; j++){
            polyPoints.push(l[j]);
        }
    }
    console.log(polyPoints);
}

function start(){
    getPolyline();
    getEndPoints();
    getStartPoints();
    getCars();
}

// Creating functions for finding random location in malta
// function randomLocation(xUpperBound, yUpperBound, xLowerBound, yLowerBound){
//     var onLand = true;
//     do{
//         randomLoc = [((Math.random() * (xUpperBound - xLowerBound)) + xLowerBound), ((Math.random() * (yUpperBound - yLowerBound)) + yLowerBound)];
//         //console.log(randomLoc);

//     }while(onLand == false);

//     return randomLoc;
// };

// function clearMarkers(markerList, map){
//     for(var i = 0; i < markerList.length; i++){
//         map.removeLayer(markerList[i]);
//     }
// };

// var markers = new Array();
// function onMapClick(e) {
        
//     var marker = new L.Marker(e.latlng, {draggable:true});
//     map.addLayer(marker);
   
//     markers[marker._leaflet_id] = marker;

//     $.getJSON('http://maps.googleapis.com/maps/api/geocode/json?latlng=' + marker._latlng.lat + ',' + marker._latlng.lng + '&sensor=false', function(data) {
//          marker.bindPopup(data.results[0].geometry.location_type).openPopup();
        
//     });

//     $('#overlay > ul').append('<li>Marker '+ marker._leaflet_id + ' - <a href="#" class="remove" id="' + marker._leaflet_id + '">remove</a></li>');
// };

// // Implementation 

// // topLeft = [36.102118268621126, 14.166972272120852]
// // bottomRight = [35.7958362636939, 14.581019484501565]

// // loc = randomLocation(topLeft, bottomRight);
// //     markerList.push(L.marker([loc[0], loc[1]]).addTo(map));

// map.on('click', onMapClick);