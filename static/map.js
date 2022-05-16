// Creating the map
var map = L.map('map').setView([35.91339549900495, 14.408547418056258], 11);
var cars = new Array();
polyPoints = new Array();
var nextPolyPoint = 1;

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
    iconUrl: "../static/images/car.png",

    iconSize:     [38, 95], // size of the icon
    iconAnchor:   [19, 47.5], // point of the icon which will correspond to marker's location
});

var pickup = L.AwesomeMarkers.icon({
    icon: "arrow-up-outline",
    markerColor: 'blue'
});

var drowoff = L.AwesomeMarkers.icon({
    icon: "arrow-down-outline",
    markerColor: 'red'
});

var redMarker = L.AwesomeMarkers.icon({
    icon: 'arrow-up-outline',
    markerColor: 'red'
  });



const selectElement = document.querySelector('.preset');
console.log(selectElement);

selectElement.addEventListener('change',  (event) => {
    console.log(event.target.value);

    if(event.target.value == 'preset1'){
        preset1()
    }else if(event.target.value == 'preset2'){

    }else if(event.target.value == 'preset3'){

    }
})


function preset1(){
    var carLoc = [[14.513809277460041,35.89897453256716]];
    var trips = [[[14.423235598020154, 35.91419450996914], [14.407218690503381, 35.888194056331706]],
                [[14.49291350433241, 35.87369410066685], [14.513809277460041, 35.89897453256716]]];
    $("#p1").append("<h4>Cars:</h4><table><th>Car Id</th><th>Car Location</th><tr><td>1</td><td>Valletta</td></tr></table><h4>Trips:</h4><table><th>Start Points</th><th>End Points</th><tr><td>Marsa</td><td>Valletta</td></tr><tr><td>Mosta</td><td>Imdina</td></tr></table>");
    getData(carLoc, trips)
    
}

function preset2(){
    var carLoc = [[14.513809277460041,35.89897453256716]];
    var trips = [[[14.423235598020154, 35.91419450996914], [14.407218690503381, 35.888194056331706]],
                [[14.49291350433241, 35.87369410066685], [14.513809277460041, 35.89897453256716]]];
    $("#p1").append("<h4>Cars:</h4><table><th>Car Id</th><th>Car Location</th><tr><td>1</td><td>Valletta</td></tr></table><h4>Trips:</h4><table><th>Start Points</th><th>End Points</th><tr><td>Marsa</td><td>Valletta</td></tr><tr><td>Mosta</td><td>Imdina</td></tr></table>");
    getData(carLoc, trips)
}

function preset3(){
    var carLoc = [[14.513809277460041,35.89897453256716]];
    var trips = [[[14.423235598020154, 35.91419450996914], [14.407218690503381, 35.888194056331706]],
                [[14.49291350433241, 35.87369410066685], [14.513809277460041, 35.89897453256716]]];
    $("#p1").append("<h4>Cars:</h4><table><th>Car Id</th><th>Car Location</th><tr><td>1</td><td>Valletta</td></tr></table><h4>Trips:</h4><table><th>Start Points</th><th>End Points</th><tr><td>Marsa</td><td>Valletta</td></tr><tr><td>Mosta</td><td>Imdina</td></tr></table>");
    getData(carLoc, trips)
}

function getData(carLoc, trips){
    for(var i = 0; i < trips.length; i++){
        var marker = new L.Marker([trips[i][0][1], trips[i][0][0]], {icon: pickup});
        map.addLayer(marker);
        var marker = new L.Marker([trips[i][1][1], trips[i][1][0]], {icon: drowoff});
        map.addLayer(marker);
    }

    var r = $.ajax({ 
        url: '/loadSet', 
        type:'post',
        data: {car:carLoc, trip:trips},
     });

     r.done(function(value){
        for(var i = 0; i < value.length; i++){
            var l = polyline.decode(value[i])
            L.polyline(l, {color: 'red'}).addTo(map);
            for(var j = 0; j < l.length; j++){
                polyPoints.push(l[j]);
            }
        }

        var timings = Array(polyPoints.length).fill(700)
        for(var i = 0; i < carLoc.length; i++){
            var degree = getHeading(polyPoints);
            var marker = L.Marker.movingMarker(polyPoints, timings, {
                autostart: false,
                rotation: degree,
            });
            marker.setIcon(car);
            map.addLayer(marker);
            cars.push(marker);
        }
     });
}

// polpulating the map
function moveCar(){
    cars[0].start();
    
    setInterval( function() {
        cars[0].options.rotation = getHeading(polyPoints);
    }, 700);
}

function getHeading(polyPoints){
    var theta = Math.atan2(polyPoints[nextPolyPoint][1] - polyPoints[nextPolyPoint-1][1], polyPoints[nextPolyPoint][0] - polyPoints[nextPolyPoint-1][0]) * 180 / Math.PI;;
    nextPolyPoint += 1;
    return theta;
}

function getCars(degree){
    console.log(degree);
    var value = JSON.parse($.ajax({ 
        url: '/getCars', 
        async: false
     }).responseText);

     var timings = Array(polyPoints.length).fill(700)

     for(var i = 0; i < value.length; i++){
        var marker = L.Marker.movingMarker(polyPoints, timings, {
            autostart: false,
            rotation: degree,
        });
        marker.setIcon(car);
        map.addLayer(marker);
        cars.push(marker);
    }
}

function getStartPoints(){

    var value = JSON.parse($.ajax({ 
        url: '/getStartPoints', 
        async: false
     }).responseText);
     for(var i = 0; i < value.length; i++){
        console.log("test: "+value[i])
        var marker = new L.Marker(value[i]).addTo(map);
    }
}

function getEndPoints(){
    var value = JSON.parse($.ajax({ 
        url: '/getEndPoints', 
        async: false
     }).responseText);
     for(var i = 0; i < value.length; i++){
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
    var d = getHeading(polyPoints);
    getCars(d);
}
