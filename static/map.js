// Creating the map
var map = L.map('map').setView([35.91339549900495, 14.408547418056258], 11);
var cars = new Array();
var polyPoints = new Array();
var markers = new Array();
var polyLines = new Array();
var nextPolyPoint = 1;

L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: 'pk.eyJ1IjoibWF4aWJhciIsImEiOiJja2lka2R3Nzcxazh1MnJsYjlxYzh5bHY1In0.Oc4baw7Ru9zOkPoR7czzng'
}).addTo(map);

var loading= L.control({
    position : 'topright'
});
loading.onAdd = function(map) {
    this._div = L.DomUtil.create('div', 'loading');
    var img_log = "<div class='loadingImage'><img id='loading' src='../static/images/loading.gif'></img></div>";

    this._div.innerHTML = img_log;
    return this._div;

}
loading.addTo(map);

// loading image
$(document).ajaxStart(function() {
    $(".loadingImage").show();
  });
  
  $(document).ajaxStop(function() {
    $(".loadingImage").hide();
  });

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

//getting data from form
function getInputs(){
    var preset = document.getElementById('preset').value;
    var algorithm = document.getElementById('algorithm').value;
    var iterations = document.getElementById('iterations').value;
    callPreset(preset, algorithm, iterations)
}

// picking a preset
function callPreset(preset, algorithm, iterations){
    if(preset == 'preset1'){
        preset1(iterations)
    }else if(preset == 'preset2'){
        preset2(iterations)
    }else if(preset == 'preset3'){
        preset3(iterations)
    }
}


// preset 1
function preset1(iterations){
    clearMap();
    var carLoc = [[14.513809277460041,35.89897453256716]];
    var trips = [[[14.423235598020154, 35.91419450996914], [14.407218690503381, 35.888194056331706]],
                [[14.49291350433241, 35.87369410066685], [14.513809277460041, 35.89897453256716]]];
    $("#data").append("<h4>Cars:</h4><table><th>Car Id</th><th>Car Location</th><tr><td>1</td><td>Valletta</td></tr></table><h4>Trips:</h4><table><th>Start Points</th><th>End Points</th><tr><td>Marsa</td><td>Valletta</td></tr><tr><td>Mosta</td><td>Imdina</td></tr></table>");
    getData(carLoc, trips, iterations)
    
}

// preset 2
function preset2(iterations){
    clearMap();
    var carLoc = [[14.373826965980765, 35.88552234910637]];
    var trips = [[[14.423235598020154, 35.91419450996914], [14.407218690503381, 35.888194056331706]], // Mosta to mdina
                [[14.49291350433241, 35.87369410066685], [14.513809277460041, 35.89897453256716]],    // Marsa to Valletta
                [[14.349747452527506, 35.952589620545496], [14.488425821564382, 35.88613649037252]],  // Mellieha to Hamrun
                [[14.396021566820055, 35.93589926856759], [14.407218690503381, 35.888194056331706]],  // St Pauls bay to Mdina
                [[14.513809277460041, 35.89897453256716], [14.396021566820055, 35.93589926856759]],   // Valletta to St Pauls bay
                [[14.469391291395608,35.87691014067125], [14.488425821564382, 35.88613649037252]],    // Qormi to Hamrun
                [[14.432798599308622, 35.846482945229674], [14.480448112126183, 35.8215269171298]],   // Siggiewi to Zurrieq
                [[14.480448112126183, 35.8215269171298], [14.432798599308622, 35.846482945229674]],   // Zurrieq to siggiewi
                [[14.349747452527506, 35.952589620545496], [14.510671636760655, 35.88200443585789]]]; // Mellieha to Paola
    $("#data").append("<h4>Cars:</h4><table><th>Car Id</th><th>Car Location</th><tr><td>1</td><td>Valletta</td></tr></table><h4>Trips:</h4><table><th>Start Points</th><th>End Points</th><tr><td>Marsa</td><td>Valletta</td></tr><tr><td>Mosta</td><td>Imdina</td></tr></table>");
    getData(carLoc, trips, iterations)
}

// preset 3
function preset3(iterations){
    clearMap();
    console.log('test')
    var carLoc = [[14.513809277460041,35.89897453256716]];
    var trips = [[[14.423235598020154, 35.91419450996914], [14.407218690503381, 35.888194056331706]],
                [[14.49291350433241, 35.87369410066685], [14.513809277460041, 35.89897453256716]]];
    $("#data").append("<h4>Cars:</h4><table><th>Car Id</th><th>Car Location</th><tr><td>1</td><td>Valletta</td></tr></table><h4>Trips:</h4><table><th>Start Points</th><th>End Points</th><tr><td>Marsa</td><td>Valletta</td></tr><tr><td>Mosta</td><td>Imdina</td></tr></table>");
    getData(carLoc, trips, iterations)
}

// * gets the polyline from the python
// * draws the pickups and drop offs
// * draws the cars
function getData(carLoc, trips, iterations){
    for(var i = 0; i < trips.length; i++){
        var marker = new L.Marker([trips[i][0][1], trips[i][0][0]], {icon: pickup});
        markers.push(marker);
        map.addLayer(marker);

        var marker = new L.Marker([trips[i][1][1], trips[i][1][0]], {icon: drowoff});
        markers.push(marker);
        map.addLayer(marker);
    }

    var r = $.ajax({ 
        url: '/loadSet', 
        type:'post',
        data: {car:carLoc, trip:trips, iter:iterations}
     });

     r.done(function(value){
        for(var i = 0; i < value.length; i++){
            var l = polyline.decode(value[i])
            polyLines.push(L.polyline(l, {color: 'red'}).addTo(map));
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

// cleans the environment for another preset
function clearMarkers(){
    for(var i = 0; i < markers.length; i++){
        map.removeLayer(markers[i]);
    }
}

function clearCars(){
    for(var i = 0; i < cars.length; i++){
        map.removeLayer(cars[i]);
    }
}

function clearPolyLines(){
    for(var i = 0; i < polyLines.length; i++){
        map.removeLayer(polyLines[i]);
        polyPoints = [];
    }
}

function clearTable(){
    $("#data").empty();
}

function clearMap(){
    clearCars();
    clearMarkers();
    clearPolyLines();
    clearTable();
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
