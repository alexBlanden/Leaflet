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

var countrySelect;

var countrySelectLatLng = {
    Lat: "",
    Lng: ""
};

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
}

function updateCountryStats (){
    var contactRestCountries = fetchAjax(
        'http://localhost/LEAFLET_PRACTICE/Leaflet/Back/RestCountries.php',
        {
            
        }
    )
}

function getWeather(latitude, longitude) {
    var contactOpenWeather = fetchAjax (
        'http://localhost/LEAFLET_PRACTICE/Leaflet/Back/OpenWeather.php',
        {
            latitude,
            longitude
        }
    );
    $.when(contactOpenWeather).then(function(result){
        //Populate weather info
        const weatherUrl = `http://openweathermap.org/img/w/${result.data.weather[0].icon}.png`
        let iconElement = `<img id="wicon" src="${weatherUrl}" alt="Weather Icon"></img>`
        console.log(result)
        $("#country").html(`Welcome to ${countrySelect}`)
        $("#weather").html(`The weather is ${result.data.weather[0].description}${iconElement}`)
        $("#wicon").attr('src', `http://openweathermap.org/img/w/${result.data.weather[0].icon}.png`)
        //Populate Country facts



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
            getWeather(lat, lng)
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
                    `<option class="country_menu_select" value='{"iso":"${result.data[i].iso_a2}", "name":"${result.data[i].name}"}'>${result.data[i].name}</option>`)     
            }

            $("#country_menu").change(function(){
                var countryVal = JSON.parse($('#country_menu').val())
                let currentCountryIso = countryVal.iso;
                countrySelect = countryVal.name;
                let currentCountryName = encodeURI(countryVal.name);
                console.log(currentCountryName)
                var countryBorders = fetchAjax(
                    `http://localhost/LEAFLET_PRACTICE/Leaflet/Back/geoJsonCoordinates.php`,
                    {currentCountryIso}
                );$.when(countryBorders).then(function(result){
                    if(mapBorder){
                        mapBorder.remove()
                    }
                    mapBorder = L.geoJson().addTo(map)
                    mapBorder.addData(result.data[0].coordinates);
                    map.flyToBounds(mapBorder.getBounds())
                    
                }, function(err){
                    console.log(err.responseText);
                })
                var contactOpenCageForward = fetchAjax(
                    'http://localhost/LEAFLET_PRACTICE/Leaflet/Back/ForwardOpenCage.php',
                    {
                        currentCountryName
                    } 
                );$.when(contactOpenCageForward).then(function(result){
                    countrySelectLatLng.Lat = result.data.results[0].geometry.lat;
                    countrySelectLatLng.Lng = result.data.results[0].geometry.lng;
                    console.log(countrySelectLatLng.Lat)
                    getWeather(countrySelectLatLng.Lat, countrySelectLatLng.Lng)
                }, function (err){
                    console.error(err.responseText)
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
        $("#map, .APIbutton, .Geobutton, nav").css("filter","blur(8px)")
    })
    
    $('#map').click(function(){
        $("#map, .gobutton, nav").css("filter","");
    })

    $('.btn-close').click(function(){
        $("#map, .Geobutton, .APIbutton, nav").css("filter","");
    })
})
