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

var mapBorder = null;


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
        console.log(mapBorder)
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
        $("#country").html(`Welcome to ${result.data.sys.country}`)
        $("#weather").html(`The weather is ${result.data.weather[0].description}`)

    }, function(error){
        console.error(error.responseText)
    })
    
}

// function drawBorder(coordinates){
//     L.geoJSON(coordinates, {
//         color: "green",
//         weight: 14,
//         opacity: 1,
//         fillOpacity: 0.0 
//       }).addTo(map);
// }

$(document).ready(function(){
    $(".APIbutton").click(function(){
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

    $(".Geobutton").click(function(){
        var getGeoJson = fetchAjax(
            'http://localhost/LEAFLET_PRACTICE/Leaflet/Back/geoJsonQuery.php',
            {
                lat,
                lng
            }
        );
        $.when(getGeoJson).then(function (result){
            // console.log(JSON.stringify(result,null,2));
            for(let i= 0; i < result.data.length; i++){
                $('#country_menu').append(
                    `<option class="country_menu_select" value="${result.data[i].iso_a2}">${result.data[i].name}</option>`)     
            }

            $("#country_menu").change(function(){
                var country_iso = $('#country_menu').val()
                var countryBorders = fetchAjax(
                    `http://localhost/LEAFLET_PRACTICE/Leaflet/Back/geoJsonCoordinates.php`,
                    {country_iso}
                );$.when(countryBorders).then(function(result){
                    console.log(result.data[0])
                    if(mapBorder){
                        mapBorder.remove()
                    }
                    mapBorder = L.geoJson().addTo(map)
                    mapBorder.addData(result.data[0].coordinates);
                    
                }, function(err){
                    console.log(err.responseText);
                })
            }
            );
            

        }, function(err){
            console.error(err.responseText);
        })
    })

});
  


//CSS blur effect:
$(document).ready(function(){
    $(".mylinks").click(function (){
        $("#map, .gobutton, nav").css("filter","blur(8px)")
    })
    
    $('#map').click(function(){
        $("#map").css("filter","");
    })

    $('.btn-close').click(function(){
        $("#map, .Geobutton, .APIbutton, nav").css("filter","");
    })
})
