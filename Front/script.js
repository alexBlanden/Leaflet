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
var iso_a2;
var iso_a3;


function populateCountrySelect (result) {

}
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
    
    // var geoJson = L.geoJson(euCountries).addTo(map);
    // geoJson.eachLayer(function (layer) {
    //     layer.bindPopup(layer.feature.properties.name);
    // });
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
            console.log(JSON.stringify(result,null,2));
            for(let i= 0; i < result.data.length; i++){
                $('#country_menu').append(
                    `<li
                    class="country_menu_select"
                    data-iso-a2="${result.data[i].iso_a2}"
                    data-iso-a3="${result.data[i].iso_a3}"
                    data-coordinates="${result.data[i].coordinates}"><a class="dropdown-item" href="#">${result.data[i].name}</a></li>`);
            }
        }, function(err){
            console.error(err.responseText);
        })
    })
  });

  $(document).ready(function() {
    $(".country_menu_select").click(function(){
    var a2 = $('.country_menu_select').attr('data-iso-a2')
    })
    console.log(a2);
  })


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
