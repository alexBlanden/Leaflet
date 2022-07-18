var fetchAjax = function (address, query) {
    return $.ajax({
        url: address,
        type: "GET",
        dataType: "json",
        data: query
    });
}

var lat;
var lng;



var map = L.map('map').setView([51.505, -0.09], 13);

L.tileLayer('https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=gce3UfFmnaOupUCQzm4b',{
    maxZoom: 19,
    attribution: 'OpenStreetMap'
}).addTo(map);




map.locate({setView: true, maxZoom: 16});


function onLocationFound(e) {
    //Is Geolcation supported? If so, set lat and lng variables
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(determineCoordinates)
    } else {
        document.getElementById("map").innerHTML =
        "Geolocation is not supported by this browser.";
    }
    function determineCoordinates(position){
            lat = position.coords.latitude;
            lng = position.coords.longitude;
            console.log(lat, lng);
     }
    //Add marker at user's location and add popup
    var radius = e.accuracy;
    L.marker(e.latlng).addTo(map)
        .bindPopup(`You are within ${Math.floor(radius)} meters from this point. Coordinates: ${e.latlng.toString()}`).openPopup();
        L.circle(e.latlng, radius).addTo(map);
    }


map.on('locationfound', onLocationFound)



function onLocationError(e) {
    alert(e.message);

}


map.on('locationerror', onLocationError);


$(function(){
    var contactServer = fetchAjax(
        '../Back/Back1.php',
        {
            lat,
            lng
        }
    );
    $.when(contactServer).then(function(result){
        console.log(result);
    })
});

