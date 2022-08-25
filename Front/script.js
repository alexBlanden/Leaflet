var fetchAjax = function (address, query) {
    return $.ajax({
        url: address,
        type: "GET",
        dataType: "json",
        data: query
    });
}


var map;

var initialLocationData = {
    lat:"",
    lng:"",
    countryName:"",
    countryIsoA2:"",
    flag:"",
    weather: {
        description: null,
        icon: ""
    }
}

var countrySelectData = {
    lat:"",
    lng:"",
    countryName:"",
    countryIso:"",
    flag: "",
    weather: {
        description: null,
        icon: ""
    }
}
var countrySelect
var countrySelectLat
var countrySelectLng
var countrySelectIso

var mapBorder = null;



//If getCurrentPosition is successful, load as appropriate. If not, display error for user 
const success = (position) => {
    initialLocationData.lat =  position.coords.latitude;
    initialLocationData.lng = position.coords.longitude;
    console.log(initialLocationData.lat)
    console.log(initialLocationData.lng)

    loadMap()

    
    // getLocationFromCoordinates();
   function getData(){
        getInitialWeather(initialLocationData.lat, initialLocationData.lng);
        getDataFromCoordinates(initialLocationData.lat, initialLocationData.lng);
    }

    getData()

    //Use data in initialLocationObject to generate html for info:
    function writeData () {
        console.log('starting')
    }

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
    const lat = initialLocationData.lat;
    const lng = initialLocationData.lng; 
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

//Uses latitude and longitude to add data to initialLocation object
function getDataFromCoordinates (lat, lng) {
    var contactOpenCage = fetchAjax(
        'http://localhost/LEAFLET_PRACTICE/Leaflet/Back/openCage.php',
        {
            lat,
            lng
        }
    );
    $.when(contactOpenCage).then(function(result){
        //saves iso and country name from returned data
        initialLocationData.isoA2 = result.data.results[0].components.country_code;
        initialLocationData.countryName = result.data.results[0].components.state

        $("#country").html(`${initialLocationData.countryName}`)

        getFromRestCountries(initialLocationData.isoA2)
    }, function(err){
        console.error(`Error:${err.responseText}`)
    })
};

function getInitialBorders () {
    var getGeoJson = fetchAjax(
        'http://localhost/LEAFLET_PRACTICE/Leaflet/Back/geoJsonQuery.php',
        {
            lat,
            lng
        }
    );
    $.when(getGeoJson).then(function (result){

    })
}
//Uses coordinates to get weather info for user lat/lng
function getInitialWeather(latitude, longitude) {
    var contactOpenWeather = fetchAjax (
        'http://localhost/LEAFLET_PRACTICE/Leaflet/Back/OpenWeather.php',
        {
            latitude,
            longitude
        }
    );
    $.when(contactOpenWeather).then(function(result){
        //Populate weather info.
        console.log(result)
        initialLocationData.weather.description = result.data.weather[0].description;
        initialLocationData.weather.icon = result.data.weather[0].icon
        updateWeatherInfo(
            initialLocationData.weather.icon, 
            initialLocationData.weather.description
            )
    }, function(error){
        console.error(error.responseText)
    })
    
}

function getCountrySelectWeather (latitude, longitude) {
    var contactOpenWeather = fetchAjax (
        'http://localhost/LEAFLET_PRACTICE/Leaflet/Back/OpenWeather.php',
        {
            latitude,
            longitude
        }
    );
    $.when(contactOpenWeather).then(function(result){
        //Populate weather info.
        console.log(result)
        countrySelectData.weather.description = result.data.weather[0].description;
        countrySelectData.weather.icon = result.data.weather[0].icon
        updateWeatherInfo(
            countrySelectData.weather.icon, 
            countrySelectData.weather.description
            )
    }, function(error){
        console.error(error.responseText)
    })
    
}

function updateWeatherInfo (weatherIcon, weatherDescription){
    const weatherUrl = `http://openweathermap.org/img/w/${weatherIcon}.png`
    const iconElement = `<img id="wicon" src="${weatherUrl}" alt="Weather Icon"></img>`

    $("#weather").html(`The weather is ${weatherDescription}${iconElement}`)
}

//Use iso code to fetch data from RestCountries API:
function getFromRestCountries(iso) {
    var contactRestCountries = fetchAjax(
        'http://localhost/LEAFLET_PRACTICE/Leaflet/Back/RestCountries.php',
        {
            iso
        }
    );
    $.when(contactRestCountries).then(function(result){
        console.log(result)
        $("#flag").attr({
            src:`https://flagcdn.com/w320/${iso.toLowerCase()}.png`,
            height: '45px'
        })
        $("#country").html(`${result.data[0].name.common}`)
        $("#population > h6").html(`Population: ${displayNumber(result.data[0].population)}`)
        $("#capitalcity > h6").html(`Capital City: ${result.data[0].capital}`)
    }, function(error){
        console.log(error.responseText)
    })
}
function displayNumber(number) {
    const string = number.toString()
    const length = string.length
    if(length < 7){
        return number
    } else if(length == 7){
        return(`${string[0]} million`)
    } else if(length == 8){
        return(`${string[0]}${string[1]} million`)
    } else if(length == 9){
    return(`${string[0]}${string[1]}${string[2]} million`)
    } else if(length > 9){
    return(`${string[0]}.${string[1]} billion`)
    }
}


$(document).ready(function(){
    // $(".APIbutton").click(function(){
    //     console.log("sending info....")
    // }

        var getGeoJson = fetchAjax(
            'http://localhost/LEAFLET_PRACTICE/Leaflet/Back/geoJsonQuery.php',
            {
                
            }
        );
        $.when(getGeoJson).then(function (result){
            for(let i= 0; i < result.data.length; i++){
                $('#country_menu').append(
                    `<option class="country_menu_select" value='{"iso":"${result.data[i].iso_a2}", "name":"${result.data[i].name}"}'>${result.data[i].name}</option>`)     
            }

            $("#country_menu").change(function(){
                //Value made up of iso code and name of country
                var countryVal = JSON.parse($('#country_menu').val())
                countrySelectData.countryIso = countryVal.iso
                const currentCountryIso = countrySelectData.countryIso;
                const currentCountryName = encodeURI(countryVal.name);
                countrySelectData.countryName = countryVal.name;
                countrySelect = countryVal.name;

                //First retrieve static borders from geojson file
                var countryBorders = fetchAjax(
                    `http://localhost/LEAFLET_PRACTICE/Leaflet/Back/geoJsonCoordinates.php`,
                    {currentCountryIso}
                );$.when(countryBorders).then(function(result){
                    //Check for previous selected country's border
                    if(mapBorder){
                        mapBorder.remove()
                    }
                    //Add empty layer to map
                    mapBorder = L.geoJson().addTo(map)
                    //Add data to layer
                    mapBorder.addData(result.data[0].coordinates);
                    //Center map view on newly selected country
                    map.flyToBounds(mapBorder.getBounds())
                    
                }, function(err){
                    console.log(err.responseText);
                })
                //Perform forward Geocoding using country name
                var contactOpenCageForward = fetchAjax(
                    'http://localhost/LEAFLET_PRACTICE/Leaflet/Back/ForwardOpenCage.php',
                    {
                        currentCountryName
                    } 
                );$.when(contactOpenCageForward).then(function(result){
                    console.log(result.data.results[0])
                    //Set Latitude and Longitude
                    countrySelectData.lat = result.data.results[0].geometry.lat;
                    countrySelectData.lng = result.data.results[0].geometry.lng;
                    //Populate Weather Info
                    getCountrySelectWeather(countrySelectData.lat, countrySelectData.lng)
                    getFromRestCountries(currentCountryIso)
                }, function (err){
                    console.error(err.responseText)
                }) 
            }
            );
        }, function(err){
            console.error(err.responseText);
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
