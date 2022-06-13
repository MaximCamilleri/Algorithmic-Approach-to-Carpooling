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

// Creating random colour
function randColour(){
    var colour;
    var r = Math.floor(Math.random() * 255);
    var g = Math.floor(Math.random() * 255);
    var b = Math.floor(Math.random() * 255);
    colour= "rgb("+r+" ,"+g+","+ b+")"; 
    return colour;
}

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
    var passPerCar = document.getElementById('passPerCar').value;
    var tabuSize = document.getElementById('tabuSize').value;
    callPreset(preset, algorithm, iterations, passPerCar, tabuSize)
}
//select Algorithm
const selectElem = document.querySelector('.algorithm');
console.log(selectElem);

selectElem.addEventListener('change',  (event) => {
    console.log(event.target.value);
    if(event.target.value == 0){
        $("#form").html("<tr id='p1'><td><label for='preset'>Preset: <select name='preset' class='preset' id='preset'><option value='None' selected='selected'>None</option><option value='preset1'>Preset 1</option><option value='preset2'>Preset 2</option><option value='preset3'>Preset 3</option></select></label></td></tr><tr><td id = 'data'></td></tr><tr><td>Number of iterations: <input type='number' id='iterations' name='iterations' min='1'></td></tr><tr><td>Size of Tabu List: <input type='number' id='tabuSize' name='tabuSize' min='1'></td></tr><tr><td>Num of passengers /car: <input type='number' id='passPerCar' name='passPerCar' min='1'></td></tr><tr><td><input type='button' value='submit' onClick='getInputs();''></td></tr>");
        // preset table
        const selectElement = document.querySelector('.preset');
        console.log(selectElement);

        selectElement.addEventListener('change',  (event) => {
            console.log(event.target.value);

            if(event.target.value == 'preset1'){
                clearTable()
                $("#data").append("<h4>Cars:</h4><table class='pre'><th>Car Id</th><th>Car Location</th><tr><td>1</td><td>Valletta</td></tr></table><h4>Trips:</h4><table><th>Start Points</th><th>End Points</th><tr><td>Marsa</td><td>Valletta</td></tr><tr><td>Mosta</td><td>Imdina</td></tr></table><br>");
            }else if(event.target.value == 'preset2'){
                clearTable()
                $("#data").append("<h4>Cars:</h4><table class='pre'><th>Car Id</th><th>Car Location</th><tr><td>1</td><td>Valletta</td></tr></table><h4>Trips:</h4><table><th>Start Points</th><th>End Points</th><tr><td>Mosta</td><td>Mdina</td></tr><tr><td>Marsa</td><td>Valletta</td></tr><tr><td>Mellieha</td><td>Hamrun</td></tr><tr><td>St Pauls bay</td><td>Mdina</td></tr><tr><td>Valletta</td><td>St Pauls bay</td></tr><tr><td>Qormi</td><td>Humrun</td></tr><tr><td>Siggiewi</td><td>Zurrieq</td></tr><tr><td>Zurrieq</td><td>Siggiewi</td></tr><tr><td>Mellieha</td><td>Paola</td></tr></table><br>");
            }else if(event.target.value == 'preset3'){
                clearTable()
            }
        })
    }else if(event.target.value == 1){
        $("#form").html("<tr id='p1'><td><label for='preset'>Preset: <select name='preset' class='preset' id='preset'><option value='None' selected='selected'>None</option><option value='preset1'>Preset 1</option><option value='preset2'>Preset 2</option><option value='preset3'>Preset 3</option></select></label></td></tr><tr><td id = 'data'></td></tr><tr><td>Number of iterations: <input type='number' id='iterations' name='iterations' min='1'></td></tr><tr><td>Size of population <input type='number' id='tabuSize' name='tabuSize' min='1'></td></tr><tr><td>Num of passengers /car: <input type='number' id='passPerCar' name='passPerCar' min='1'></td></tr><tr><td><input type='button' value='submit' onClick='getInputs();''></td></tr>")
        // preset table
        const selectElement = document.querySelector('.preset');
        console.log(selectElement);

        selectElement.addEventListener('change',  (event) => {
            console.log(event.target.value);

            if(event.target.value == 'preset1'){
                clearTable()
                $("#data").append("<h4>Cars:</h4><table class='pre'><th>Car Id</th><th>Car Location</th><tr><td>1</td><td>Valletta</td></tr></table><h4>Trips:</h4><table><th>Start Points</th><th>End Points</th><tr><td>Marsa</td><td>Valletta</td></tr><tr><td>Mosta</td><td>Imdina</td></tr></table><br>");
            
            }else if(event.target.value == 'preset2'){
                clearTable()
                $("#data").append("<h4>Cars:</h4><table class='pre'><th>Car Id</th><th>Car Location</th><tr><td>1</td><td>Rabat</td></tr><tr><td>2</td><td>Mosta</td></tr><tr><td>3</td><td>Hamrun</td></tr></table><h4>Trips:</h4><table><th>Start Points</th><th>End Points</th><tr><td>Mosta</td><td>Mdina</td></tr><tr><td>Marsa</td><td>Valletta</td></tr><tr><td>Mellieha</td><td>Hamrun</td></tr><tr><td>St Pauls bay</td><td>Mdina</td></tr><tr><td>Valletta</td><td>St Pauls bay</td></tr><tr><td>Qormi</td><td>Humrun</td></tr><tr><td>Siggiewi</td><td>Zurrieq</td></tr><tr><td>Zurrieq</td><td>Siggiewi</td></tr><tr><td>Mellieha</td><td>Paola</td></tr></table><br>");

            }else if(event.target.value == 'preset3'){
                clearTable()

            }
        })
    }else if(event.target.value == 'None'){
        $("#form").empty()
    }
})

// picking a preset
function callPreset(preset, algorithm, iterations, passPerCar, tabuSize){
    if(preset == 'preset1'){
        preset1(iterations, passPerCar, tabuSize, algorithm)
    }else if(preset == 'preset2'){
        preset2(iterations, passPerCar, tabuSize, algorithm)
    }else if(preset == 'preset3'){
        preset3(iterations, passPerCar, tabuSize, algorithm)
    }
}


// preset 1
function preset1(iterations, passPerCar, tabuSize, algorithm){
    clearMap();
    var carLoc = [[14.513809277460041,35.89897453256716]];
    var trips = [[[14.423235598020154, 35.91419450996914], [14.407218690503381, 35.888194056331706]],
                [[14.49291350433241, 35.87369410066685], [14.513809277460041, 35.89897453256716]]];
    getData(carLoc, trips, iterations, passPerCar, tabuSize, algorithm)
    
}

// preset 2
function preset2(iterations, passPerCar, tabuSize, algorithm){
    clearMap();
    var carLoc = [[14.373826965980765, 35.88552234910637], // Rabat
                  [14.423235598020154, 35.91419450996914], // Mosta
                  [14.488425821564382, 35.88613649037252]]; // Hamrun
    var trips = [[[14.423235598020154, 35.91419450996914], [14.407218690503381, 35.888194056331706]], // Mosta to mdina
                [[14.49291350433241, 35.87369410066685], [14.513809277460041, 35.89897453256716]],    // Marsa to Valletta
                [[14.349747452527506, 35.952589620545496], [14.488425821564382, 35.88613649037252]],  // Mellieha to Hamrun
                [[14.396021566820055, 35.93589926856759], [14.407218690503381, 35.888194056331706]],  // St Pauls bay to Mdina
                [[14.513809277460041, 35.89897453256716], [14.396021566820055, 35.93589926856759]],   // Valletta to St Pauls bay
                [[14.469391291395608,35.87691014067125], [14.488425821564382, 35.88613649037252]],    // Qormi to Hamrun
                [[14.432798599308622, 35.846482945229674], [14.480448112126183, 35.8215269171298]],   // Siggiewi to Zurrieq
                [[14.480448112126183, 35.8215269171298], [14.432798599308622, 35.846482945229674]],   // Zurrieq to siggiewi
                [[14.349747452527506, 35.952589620545496], [14.510671636760655, 35.88200443585789]]]; // Mellieha to Paola
    getData(carLoc, trips, iterations, passPerCar, tabuSize, algorithm)
}

// preset 3
function preset3(iterations, passPerCar, tabuSize, algorithm){
    clearMap();
    var carLoc = [[14.381200578207975, 35.96174457330435],   // Selmun
                  [14.396564271819427, 35.93596619845886],   // St Pauls Bay
                  [14.361974506556155, 35.91942469964549],   // Mgarr
                  [14.40652063325507, 35.888417448220515],   // Mdina
                  [14.38532045332923, 35.86289340290897],    // Had-Dingli
                  [14.438792970654086, 35.876734437130544],  // Haz-Zebbug
                  [14.454156663043637, 35.895301272593],     // Balzan
                  [14.493810440887742, 35.893632521550096],  // Pieta
                  [14.511148240026317, 35.86741460941653],   // Tarxien
                  [14.492866305085785, 35.836108659428106]]; // Hal Safi
    
    var trips = [[[14.423235598020154, 35.91419450996914], [14.407218690503381, 35.888194056331706]],   // Mosta to mdina
                 [[14.545566346261706, 35.87283971673811], [14.535609986947806, 35.85454588170675]],    // Haz-Zabbar to zejtun
                 [[14.495355394293833, 35.90566064778522], [14.487029817971004, 35.89599657516383]],    // Gzira to Msida
                 [[14.466087130603144, 35.895301272651956], [14.419738560123472, 35.89057305350045]],   // Birkirkara to Attard
                 [[14.49291350433241, 35.87369410066685], [14.513809277460041, 35.89897453256716]],     // Marsa to Valletta
                 [[14.430639056958517, 35.93221338788409], [14.475099351136112, 35.928946908622805]],   // Naxxar to Pembroke
                 [[14.349747452527506, 35.952589620545496], [14.488425821564382, 35.88613649037252]],   // Mellieha to Hamrun
                 [[14.452157373873439, 35.909293992478155], [14.439899447417208, 35.89882472107257]],   // Iklin to Lija
                 [[14.470057608789288, 35.919017557794774], [14.49148169541245, 35.922851227239875]],   // Sqieqi to Paceville
                 [[14.475099351136112, 35.928946908622805], [14.495355394293833, 35.90566064778522]],   // Pembroke to Gzira
                 [[14.396021566820055, 35.93589926856759], [14.407218690503381, 35.888194056331706]],   // St Pauls bay to Mdina
                 [[14.498520687544623, 35.913751455350116], [14.485762437559565, 35.90828089771133]],   // Sliema to Kappara
                 [[14.488811272099182, 35.91292262373294], [14.470057609526041, 35.84402708219966]],    // Saint Julians to Mqabba
                 [[14.513809277460041, 35.89897453256716], [14.396021566820055, 35.93589926856759]],    // Valletta to St Pauls bay
                 [[14.53180611175649, 35.89131402793584], [14.454060341546587, 35.83288089148569]],     // Kalkara Qrendi
                 [[14.534537227691992, 35.85846298643352], [14.54109190567531, 35.890133986928]],       // Zejtun to Smart City
                 [[14.469391291395608,35.87691014067125], [14.488425821564382, 35.88613649037252]],     // Qormi to Hamrun
                 [[14.483531114746006, 35.841025986602226], [14.480557233033442, 35.82193439301399]],   // Kirkop to zurrieq
                 [[14.554493402284638, 35.86057243985436], [14.43664734447984, 35.93252407235249]],     // Marsaskala to naxxar
                 [[14.432798599308622, 35.846482945229674], [14.480448112126183, 35.8215269171298]],    // Siggiewi to Zurrieq
                 [[14.503166650376741, 35.847493884379865], [14.538528892077835, 35.84081464096383]],   // Gudja to Marsaxlokk
                 [[14.502480004433215, 35.91098815347837], [14.351417332252417, 35.952782156260305]],   // Sliema Mellieha
                 [[14.480448112126183, 35.8215269171298], [14.432798599308622, 35.846482945229674]],    // Zurrieq to siggiewi
                 [[14.475443339054953, 35.90792935616374], [14.509775612551161, 35.88248114168623]],    // San Gwann to paola
                 [[14.430381563595416, 35.84661492276736], [14.420425204281518, 35.89050351825068]],    // Siggiewi to Attard
                 [[14.349747452527506, 35.952589620545496], [14.510671636760655, 35.88200443585789]],   // Mellieha to Paola
                 [[14.505998399035033, 35.85600676106393], [14.49243715100403, 35.87374386499355]],     // Santa Lucija to Marsa
                 [[14.429694917902895, 35.91775645709981], [14.457761551486044, 35.90976230777559]],    // Mosta to Iklin
                 [[14.411584641554525, 35.948404792667816], [14.3615453529338, 35.91866009299031]],     // Buggibba to Mgarr
                 [[14.351417332252417, 35.952782156260305], [14.3615453529338, 35.91866009299031]],     // Mellieha to Mgarr
                 [[14.475700165922293, 35.890016773865945], [14.486257340022377, 35.895857515103536]]]; // Santa Venera to Msida
    getData(carLoc, trips, iterations, passPerCar, tabuSize, algorithm)
}

// * gets the polyline from the python
// * draws the pickups and drop offs
// * draws the cars
function getData(carLoc, trips, iterations, passPerCar, tabuSize, algorithm){
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
        data: {car:carLoc, trip:trips, iter:iterations, pPc: passPerCar, ts:tabuSize, alg:algorithm}
     });

     r.done(function(value){
        var count = Object.keys(value).length -1;
        for(var k = 0; k < count; k++){
            p = [];
            colour = randColour();
            for(var i = 0; i < value[k].length; i++){
                var l = polyline.decode(value[k][i])
                polyLines.push(L.polyline(l, {color: colour, weight: 5}).addTo(map));
                for(var j = 0; j < l.length; j++){
                    p.push(l[j]);
                }
            }
            polyPoints.push(p);
        }
        var carsTest = new Array();
        for(var i = 0; i < carLoc.length; i++){
            var timings = Array(polyPoints[i].length).fill(700)
            var degree = getHeading(polyPoints[i]);
            console.log(polyPoints[i]);
            var marker = L.Marker.movingMarker(polyPoints[i], timings, {
                autostart: false,
                rotation: degree,
            });
            marker.setIcon(car);
            map.addLayer(marker);
            carsTest.push(marker);   
        }
        $("#runTime").text(value[count].toFixed(5) + 's');

        for(var i = 0; i < carsTest.length; i++){
            startCar(carsTest[i], polyPoints[i])
        }
     });
}

function startCar(car, polyPoints){
    car.start();
    setInterval( function() {
        car.options.rotation = getHeading(polyPoints);
    }, 700);
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
}

// polpulating the map
function moveCar(){
    cars[0].start();
    
    setInterval( function() {
        cars[0].options.rotation = getHeading(polyPoints[0]);
    }, 700);
}

function getHeading(polyPoints){
    var theta = Math.atan2(polyPoints[nextPolyPoint][1] - polyPoints[nextPolyPoint-1][1], polyPoints[nextPolyPoint][0] - polyPoints[nextPolyPoint-1][0]) * 180 / Math.PI;
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



function start(){
    getPolyline();
    getEndPoints();
    getStartPoints();
    var d = getHeading(polyPoints);
    getCars(d);
}
