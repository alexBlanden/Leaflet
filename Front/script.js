var fetchAjax = function (address, query) {
    return $.ajax({
        url: address,
        type: "GET",
        dataType: "json",
        data: query
    });
}



var map = L.map('map').setView([51.505, -0.09], 13);

L.tileLayer('https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=gce3UfFmnaOupUCQzm4b',{
    maxZoom: 19,
    attribution: 'OpenStreetMap'
}).addTo(map);




map.locate({setView: true, maxZoom: 16});

function onLocationFound(e) {
    var radius = e.accuracy;


    L.marker(e.latlng).addTo(map)
        .bindPopup(`You are within ${Math.floor(radius)} meters from this point. Coordinates: ${e.latlng.toString()}`).openPopup();
    
    L.circle(e.latlng, radius).addTo(map);
}

map.on('locationfound', onLocationFound);
console.log(`Your coordinates are ${map.getCenter()}`);
const coordinates = map.getCenter().toString();



function onLocationError(e) {
    alert(e.message);

}


map.on('locationerror', onLocationError);

$.on('load', function(){
    var contactServer = fetchAjax(
        '../Back/Back1.php',
        coordinates
    );
    $.when(contactServer).then(function(result){
        console.log(result);
    })
});

