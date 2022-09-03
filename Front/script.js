var fetchAjax = function (address, query) {
    return $.ajax({
        url: address,
        type: "GET",
        dataType: "json",
        data: query
    });
}


var map;

var currencyName;
var currencySymbol;
var currencyCode;
var languages;
var boundingBox = {};
var layerControl;
var featureGroup;

var initialLocationData = {
    lat:"",
    lng:"",
    countryName:"",
    countryIsoA2:"",
    flag:"",
    weather: {
        description: null,
        icon: "",
        temp: ""
    },
    currencyCode: ""
}

var countrySelectData = {
    lat:"",
    lng:"",
    countryName:"",
    countryIso:"",
    flag: "",
    weather: {
        description: null,
        icon: "",
        temp: ""
    },
    currencyCode: ""
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
        .bindPopup(`Found you! Click <a href="#countryinfo" data-bs-toggle="offcanvas" class="mylinks">Info</a> to find out more</p>`).openPopup();
        L.circle([lat, lng], {radius: 500}).addTo(map);
        layerControl = L.control.layers().addTo(map);
        featureGroup = L.layerGroup();

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
        initialLocationData.countryName = result.data.results[0].components.state;

        $("#country").html(`${initialLocationData.countryName}`)

        getFromRestCountries(initialLocationData.isoA2)
        drawInitialCountryBorders(initialLocationData.isoA2)
    }, function(err){
        console.error(`Error:${err.responseText}`)
    })
    };
    getDataFromCoordinates(initialLocationData.lat, initialLocationData.lng)
    
}

function drawInitialCountryBorders (iso) {
    var countryBorders = fetchAjax(
        `http://localhost/LEAFLET_PRACTICE/Leaflet/Back/geoJsonCoordinates.php`,
        {iso}
    );$.when(countryBorders).then(function(result){
        //Check for previous selected country's border
        if(mapBorder){
            mapBorder.remove()
        }
        //Add empty layer to map
        mapBorder = L.geoJson().addTo(map)
        //Add data to layer
        mapBorder.addData(result.data[0].coordinates); 
    }, function(err){
        console.log(err.responseText);
    })
}

function drawCountryBorders (iso) {
    var countryBorders = fetchAjax(
        `http://localhost/LEAFLET_PRACTICE/Leaflet/Back/geoJsonCoordinates.php`,
        {iso}
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
        boundingBox = mapBorder.getBounds();
        map.flyToBounds(boundingBox)
        
    }, function(err){
        console.log(err.responseText);
    })
}

function getPlacesOfInterest (bbox) {
    var placesOfInterest = fetchAjax(
        `http://localhost/LEAFLET_PRACTICE/Leaflet/Back/OpenTripMap.php`,
        {
            bbox
        }
    );
    $.when(placesOfInterest).then(function(result){

        const wikidataUrls = [];
        for(let i = 0; i< result.data.features.length; i++){
            wikidataUrls.push(result.data.features[i].properties.wikidata)
        }

        function getWikipediaFromWikiData(wikiData){
            var queryWikiData = fetchAjax('http://localhost/LEAFLET_PRACTICE/Leaflet/Back/OpenTripMap.php',
            {
                wikiData
            }
            );
            $.when(queryWikiData).then(function(result){
                console.log(result)
            }, function(err){
                console.log(err.responseText)
            })
        }

        getWikipediaFromWikiData(wikidataUrls)

        const markers = L.markerClusterGroup();
            
        const geojsonMarkerOptions = {
            radius: 8,
            fillColor: "#6d7280",
            color: "#000",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8
        };
        const featureData = L.geoJSON(result.data, {
                onEachFeature: function (feature, layer) {
                    const content =
                    `<h4>${feature.properties.name}</h4>`
                    layer.bindPopup(content)
                },
                pointToLayer: function (feature, latlng) {
                    return L.circleMarker(latlng, geojsonMarkerOptions);
                },
            });
        
        markers.addLayer(featureData);
        map.addLayer(markers);

    
    }, function(err){
        console.log(err.responseText)
    })
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
        initialLocationData.weather.description = result.data.weather[0].description;
        initialLocationData.weather.icon = result.data.weather[0].icon
        initialLocationData.weather.temp = Math.floor(result.data.main.temp)
        updateWeatherInfo(
            initialLocationData.weather.icon, 
            initialLocationData.weather.description,
            initialLocationData.weather.temp
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
        countrySelectData.weather.description = result.data.weather[0].description;
        countrySelectData.weather.icon = result.data.weather[0].icon
        countrySelectData.weather.temp = Math.floor(result.data.main.temp)
        updateWeatherInfo(
            countrySelectData.weather.icon, 
            countrySelectData.weather.description,
            countrySelectData.weather.temp
            )
    }, function(error){
        console.error(error.responseText)
    })
    
}

function updateWeatherInfo (weatherIcon, weatherDescription, weatherTemp){
    const weatherUrl = `http://openweathermap.org/img/w/${weatherIcon}.png`
    const iconElement = `<img id="wicon" src="${weatherUrl}" alt="Weather Icon"></img>`

    $("#weather").html(`Weather: ${weatherDescription}${iconElement}`)
    $("#temp").html(`Temperature: ${weatherTemp}&#8451`)
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
        $("#flag").attr({
            src:`https://flagcdn.com/w320/${iso.toLowerCase()}.png`,
            height: '45px'
        })
        $("#country").html(`${result.data[0].name.common}`)
        $("#population > h6").html(`Population: ${conovertPopulationToString(result.data[0].population)}`)
        $("#capitalcity > h6").html(`Capital City: ${result.data[0].capital}`)
        currencyCode = Object.keys(result.data[0].currencies)[0];
        currencySymbol = result.data[0].currencies[currencyCode].symbol
        currencyName = result.data[0].currencies[currencyCode].name
        var languageKey = Object.keys(result.data[0].languages)
        if(languageKey.length > 1){
            languages = result.data[0].languages[languageKey[0]]
        } else {
            languages = result.data[0].languages[languageKey]
        }
        $("#language > h6").html(`Language: ${languages}`)

        getCurrencyInfo(currencyCode)
    }, function(error){
        console.log(error.responseText)
    })
}
function conovertPopulationToString(number) {
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

function getCurrencyInfo(currencyCode){
    var contactOpenExchange = fetchAjax('http://localhost/LEAFLET_PRACTICE/Leaflet/Back/ExchangeRates.php',
    {
        currencyCode
    }
    );
    $.when(contactOpenExchange).then(function(result){
        const currencyValue = result.data.rates
        $("#currencyname").html(`Currency: ${currencyName}`)
        $("#vsthedollar").html(`1 US Dollar is worth: ${currencySymbol} ${Object.values(currencyValue)}`)
    }, function (error){
        console.log(error.responseText)
    })

}

// function getWikiBySearchTerm (searchTerm) {
//     searchTerm = encodeURI(searchTerm)
//     var contactWikiSearch = fetchAjax(
//         'http://localhost/LEAFLET_PRACTICE/Leaflet/Back/Wikisearch.php',
//         {
//            searchTerm
//         }
//     );
//     $.when(contactWikiSearch).then(function (result) {
//         $("#wikiPic > img").attr('src', `${result.data[0].thumbnailImg}`)
//         $("#wikiPic").attr('href', `${result.data[0].wikipediaUrl}`)
//     }, function(error){
//         console.log(error.responseText)
//     })
// }

//Load data from GeoJson file for country select in navigation menu:
$(document).ready(function(){
        var getGeoJson = fetchAjax(
            'http://localhost/LEAFLET_PRACTICE/Leaflet/Back/geoJsonQuery.php',
            {
                
            }
        );
        $.when(getGeoJson).then(function (result){
            for(let i= 0; i < result.data.length; i++){
                $('#country_menu').append(
                    `<option class="country_menu_select" value='{"iso":"${result.data[i].iso_a2}", "name":"${result.data[i].name}"}'>${result.data[i].name}</option>`)
                // $('#datalistOptions').append(
                //     `<option value= ${result.data[i].name}>`
                // )     
            }

            $("#country_menu").change(function(){
                //Value made up of iso code and name of country
                var countryVal = JSON.parse($('#country_menu').val())
                countrySelectData.countryIso = countryVal.iso
                const currentCountryIso = countrySelectData.countryIso;
                const currentCountryName = encodeURI(countryVal.name);
                countrySelectData.countryName = countryVal.name;
                countrySelect = countryVal.name;

                drawCountryBorders(currentCountryIso)
                
                //Perform forward Geocoding using country name
                var contactOpenCageForward = fetchAjax(
                    'http://localhost/LEAFLET_PRACTICE/Leaflet/Back/ForwardOpenCage.php',
                    {
                        currentCountryName
                    } 
                );$.when(contactOpenCageForward).then(function(result){
                    //Set Latitude and Longitude
                    countrySelectData.lat = result.data.results[0].geometry.lat;
                    countrySelectData.lng = result.data.results[0].geometry.lng;
                    //Populate Weather Info
                    getCountrySelectWeather(countrySelectData.lat, countrySelectData.lng)
                    getFromRestCountries(currentCountryIso)
                    boundingBox = JSON.parse(JSON.stringify(result.data.results[0].bounds))
                    getPlacesOfInterest(boundingBox)
                }, function (err){
                    console.error(err.responseText)
                }) 
            }
            );
        }, function(err){
            console.error(err.responseText);
        })

});
  


// CSS blur effect:
$(document).ready(function(){
    $(".mylinks").click(function (){
        $("#map, nav").css("filter","blur(25px)")
    })
    
    $('#map').mouseover(function(){
        $("#map, nav").css("filter","");
    })

    $('.btn-close').click(function(){
        $("#map, nav").css("filter","");
    })
})
