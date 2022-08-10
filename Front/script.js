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
    map = L.map("map").setView([lat, lng], 5)
    L.tileLayer('https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=gce3UfFmnaOupUCQzm4b',
    {
    maxZoom: 19,
    attribution: 'OpenStreetMap'
    }).addTo(map);
    L.marker([lat, lng]).addTo(map)
        .bindPopup(`Found you! Click Info to find out more</p>`).openPopup();
        L.circle([lat, lng], {radius: 500}).addTo(map);
}

function getWeather() {
    var contactOpenWeather = fetchAjax (
        'http://localhost/LEAFLET_PRACTICE/Leaflet/Back/OpenWeather.php',
        {
            lat,
            lng
        }
    );
    $.when(contactOpenWeather).then(function(result){
        console.log(`The weather is ${result.data.weather[0].description}`);
        $("#country").html(`Welcome to ${result.data.sys.country}`)
        $("#weather").html(`The weather is ${result.data.weather[0].description}`)

    }, function(error){
        console.error(error.responseText)
    })
    
}


$(document).ready(function(){
    $("button").click(function(){
        console.log("sending info....")
        var contactOpenCage = fetchAjax(
            'http://localhost/LEAFLET_PRACTICE/Leaflet/Back/OpenCage.php',
            {
                lat,
                lng
            }
        );
        $.when(contactOpenCage).then(function(result){
            console.log(result);
            getWeather()
        }, function(err){
            console.error(`Error:${err.responseText}`)
        })
    });
  });