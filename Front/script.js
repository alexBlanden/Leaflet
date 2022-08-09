var fetchAjax = function (address, query) {
    return $.ajax({
        url: address,
        type: "GET",
        dataType: "json",
        data: query
    });
}


var map;
var lat;
var lng;

//If getCurrentPosition is successful, load as appropriate. If not, display error for user 
const success = (position) => {
    lat =  position.coords.latitude;
    lng = position.coords.longitude;
    console.log(lat)
    console.log(lng)
    loadMap()
}
const fail = (error) => {
    document.getElementById("map").innerHTML =
        "Geolocation is not supported by this browser."
    console.log(error)
}
//Use Navigator object method to determine user's latitude and longitude
navigator.geolocation.getCurrentPosition(success, fail)

//loadMap called as part of success callback
function loadMap () {
    map = L.map("map").setView([lat, lng], 13)
    L.tileLayer('https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=gce3UfFmnaOupUCQzm4b',
    {
    maxZoom: 19,
    attribution: 'OpenStreetMap'
    }).addTo(map);
    L.marker([lat, lng]).addTo(map)
        .bindPopup(`<p>This is your location. Coordinates: ${lat} by ${lng}</p>`).openPopup();
        L.circle([lat, lng], {radius: 500}).addTo(map);
}


// $("btn btn-primary").click(function(){
//     var contactServer = fetchAjax(
//         '../Back/Back1.php',
//         {
//             lat,
//             lng
//         }
//     );
//     $.when(contactServer).then(function(result){
//         console.log(result);
//     })
// });

$(document).ready(function(){
    $("button").click(function(){
        console.log("sending info....")
        var contactServer = fetchAjax(
            'http://localhost/LEAFLET_PRACTICE/Leaflet/Back/Back1.php',
            {
                lat,
                lng
            }
        );
        $.when(contactServer).then(function(result){
            console.log(result);
        }, function(err){
            console.error(`Error:${err.responseText}`)
        })
    });
  });