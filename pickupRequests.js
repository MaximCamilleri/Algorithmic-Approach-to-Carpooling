export function randomLocation(xUpperBound, yUpperBound, xLowerBound, yLowerBound){
    var onLand = true;
    do{
        randomLoc = [((Math.random() * (xUpperBound - xLowerBound)) + xLowerBound), ((Math.random() * (yUpperBound - yLowerBound)) + yLowerBound)]
        $.getJSON('http://maps.googleapis.com/maps/api/geocode/json?latlng=' + randomLoc[0]
        + ',' + randomLoc[1] + '&sensor=false', function(data) {
            var terrain = data.results[0].geometry.location_type;
        });

        console.log(terrain);

    }while(onLand == false);

    return randomLoc;
}
