var fetchAjax = function (address, query) {
    return $.ajax({
        url: address,
        type: "GET",
        dataType: "json",
        data: query
    });
}


var map = L.map("map");
var mapStyle = {
    "fillColor": "#999595",
    "weight": 3,
    "opacity": 0.7,
    "color": "black",
    "dashArray": "20,10,5,5,5,10"
}
var countryModal = new bootstrap.Modal($('#countryModal'));
var weatherModal = new bootstrap.Modal($('#weatherModal'));

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
    sunUp: null,
    sunDown: null,
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
    sunUp: null,
    sunDown: null,
    currencyCode: ""
}
var countrySelect
var countrySelectLat
var countrySelectLng
var countrySelectIso

var mapBorder = null;
let markers = null;


//If getCurrentPosition is successful, load as appropriate. If not, display error for user 
const success = (position) => {
    //assign initial location data coordinates
    initialLocationData.lat =  position.coords.latitude;
    initialLocationData.lng = position.coords.longitude;

    loadLocation()
    loadEasyButtons();

    getInitialWeather(initialLocationData.lat,initialLocationData.lng);
    getDataFromCoordinates(initialLocationData.lat,initialLocationData.lng);
}
const fail = (error) => {
    loadMap();
    // getDataFromCoordinates(50.8476, 4.3572);
    getCountrySelectWeather(50.8476, 4.3572);
    drawInitialCountryBorders('BE');
    loadEasyButtons();
}

function loadEasyButtons () {
    var helloPopup = L.popup().setContent('Hello World!');

    L.easyButton('fa-globe', function(btn, map) {
        countryModal.toggle();
    }).addTo(map)

    L.easyButton('fa-sun', function (btn, map){
        weatherModal.toggle()

    }).addTo(map)

    L.easyButton('fa-dollar', function (btn, map){

    }).addTo(map)

    L.easyButton('fa-news', function(btn, map){

    })


}
//Use Navigator object method to determine user's latitude and longitude
navigator.geolocation.getCurrentPosition(success, fail)


function loadMap () {
    const lat = 50.8476;
    const lng = 4.3572;
    map.setView([lat, lng], 5)
    L.tileLayer('https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=gce3UfFmnaOupUCQzm4b',
    {
    maxZoom: 19,
    attribution: '<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>',
    style: 'https://api.maptiler.com/maps/basic-v2/style.json?key=gce3UfFmnaOupUCQzm4b'
    }).addTo(map);
    L.marker([lat, lng]).addTo(map)
        .bindPopup(`Location unknown! Use the buttons on the right to find out more`).openPopup();
        L.circle([lat, lng], {radius: 500}).addTo(map);
    
}
//loadMap called as part of success callback uses initial location to get country borders and rest coutries api data
function loadLocation () {
    //Save intial coordinates as local variables
    const lat = initialLocationData.lat;
    const lng = initialLocationData.lng; 

    //Assign map layer to global variable and attach popup to location
    map.setView([lat, lng], 5)
    L.tileLayer('https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=gce3UfFmnaOupUCQzm4b',
    {
    maxZoom: 19,
    attribution: '<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>',
    style: 'https://api.maptiler.com/maps/basic-v2/style.json?key=gce3UfFmnaOupUCQzm4b'
    }).addTo(map);
    L.marker([lat, lng]).addTo(map)
        .bindPopup(`Found you! Use the buttons on the right to find out more`).openPopup();
        L.circle([lat, lng], {radius: 500}).addTo(map);

        //Returns country iso and name, uses iso to draw intial country border and get population fact
    
}

function getNews(iso){
    console.log(`starting getNews function`)
    var contactNewsAPI = fetchAjax(
        'Back/newsAPI.php',
        {
            iso
        }
    );
    $.when(contactNewsAPI).then(function (result){
        console.log(result)
    }, function (error) {
        console.log(error.responseText)
    })
}

function getDataFromCoordinates(lat,lng) {
    console.log('starting getData')
    var contactOpenCage = fetchAjax(
    'Back/OpenCage.php',
    {
        lat,
        lng
    }
);
$.when(contactOpenCage).then(function(result){
    //saves iso and country name from returned data
    console.log(result)
    initialLocationData.isoA2 = result.data.results[0].components.country_code;
    initialLocationData.countryName = result.data.results[0].components.state;

    $("#country").html(`${initialLocationData.countryName}`)
    $("#drives > h6").html(`Drive on the ${result.data.results[0].annotations.roadinfo.drive_on}`)

    //Defined on line 318
    getFromRestCountries(initialLocationData.isoA2)
    getNews(initialLocationData.isoA2);
    //Defined on line 125
    drawInitialCountryBorders(initialLocationData.isoA2)
}, function(err){
    console.error(`Error:${err.responseText}`)
})
};

function drawInitialCountryBorders (iso) {
    var countryBorders = fetchAjax(
        `Back/geoJsonCoordinates.php`,
        {iso}
    );$.when(countryBorders).then(function(result){
        //Check for previous selected country's border
        if(mapBorder){
            mapBorder.remove()
        }
        mapBorder = L.geoJson(result.data[0].coordinates, {style: 
            mapStyle
        }).addTo(map)
        initialBoundingBox = JSON.parse(JSON.stringify(mapBorder.getBounds()))
        getPlacesOfInterest(initialBoundingBox) 
    }, function(err){
        console.log(err.responseText);
    })
}

function drawCountryBorders (iso) {
    var countryBorders = fetchAjax(
        `Back/geoJsonCoordinates.php`,
        {iso}
    );$.when(countryBorders).then(function(result){
        //Check for previous selected country's border
        if(mapBorder){
            mapBorder.remove()
        }

        mapBorder = L.geoJson(result.data[0].coordinates, {style: 
            mapStyle
        }).addTo(map)
        //Center map view on newly selected country
        boundingBox = mapBorder.getBounds();
        map.flyToBounds(boundingBox)
        
    }, function(err){
        console.log(err.responseText);
    })
}

//Query wiki API for features within boundary Box
function getPlacesOfInterest (bbox) {
    var placesOfInterest = fetchAjax(
        `Back/getWikiBounds.php`,
        {
            bbox
        }
    );
    $.when(placesOfInterest).then(function(result){
        console.log(result.data)
        if(result.data == undefined){
            alert("Sorry Places of interest API unavailable")
        }
        //result needs to be geoJson
        var resultAsJson = {
            type: "FeatureCollection",
            features: [

            ]
        }
        //For loop pushes geojson objects to resultAsJson array
        for(let i= 0; i < result.data.geonames.length; i++){
            resultAsJson.features.push(
                {
                    type: "Feature",
                    geometry: {
                        type: "Point",
                        coordinates: [result.data.geonames[i].lng, result.data.geonames[i].lat]
                    },
                    properties: {
                        name: result.data.geonames[i].title,
                        summary: result.data.geonames[i].summary,
                        thumbnail: result.data.geonames[i].thumbnailImg,
                        link: result.data.geonames[i].wikipediaUrl
                    }
                },
            )
        }
       //Create markers layer  
       markers = L.markerClusterGroup();
            
        const geojsonMarkerOptions = {
            radius: 8,
            fillColor: "#6d7280",
            color: "#000",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8
        };
        //Take each feature in resultAsJson, add html and bind popup
        const featureData = L.geoJSON(resultAsJson, {
                onEachFeature: function (feature, layer) {
                    const content =
                    `
                    <h6 class="text-center"><a href="https://${feature.properties.link}" class="link-primary" target="_blank">${feature.properties.name}</h6></a>
                    <p>${feature.properties.summary}</p>
                    `
                    layer.bindPopup(content)
                },
                pointToLayer: function (feature, latlng) {
                    return L.circleMarker(latlng, geojsonMarkerOptions);
                },
            });
        if(markers){
            markers.clearLayers()
            }
            
        while(resultAsJson.features.length > 0){
            resultAsJson.features.pop();
            }
        markers.addLayer(featureData);
        map.addLayer(markers);

    
    }, function(err){
        console.log(err.responseText)
    })
}

//Uses latitude and longitude to add data to initialLocation object

//Uses coordinates to get weather info for user lat/lng
function getInitialWeather(latitude, longitude) {
    var contactOpenWeather = fetchAjax (
        'Back/OpenWeather.php',
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
        initialLocationData.weather.temp = Math.floor(result.data.main.temp)
        initialLocationData.sunUp = new Date(result.data.sys.sunrise * 1000)
        initialLocationData.sunDown = new Date (result.data.sys.sunset * 1000)
        updateWeatherInfo(
            initialLocationData.weather.icon, 
            initialLocationData.weather.description,
            initialLocationData.weather.temp,
            initialLocationData.sunUp,
            initialLocationData.sunDown
            )
    }, function(error){
        console.error(error.responseText)
    })
    
}

function getCountrySelectWeather (latitude, longitude) {
    var contactOpenWeather = fetchAjax (
        'Back/OpenWeather.php',
        {
            latitude,
            longitude
        }
    );
    $.when(contactOpenWeather).then(function(result){
        console.log(result)
        //Populate weather info.
        countrySelectData.weather.description = result.data.weather[0].description;
        countrySelectData.weather.icon = result.data.weather[0].icon
        countrySelectData.weather.temp = Math.floor(result.data.main.temp)
        countrySelectData.sunUp = new Date(result.data.sys.sunrise * 1000)
        countrySelectData.sunDown = new Date (result.data.sys.sunset * 1000)
        updateWeatherInfo(
            countrySelectData.weather.icon, 
            countrySelectData.weather.description,
            countrySelectData.weather.temp,
            countrySelectData.sunUp,
            countrySelectData.sunDown
            )
    }, function(error){
        console.error(error.responseText)
    })
    
}

function updateWeatherInfo (weatherIcon, weatherDescription, weatherTemp, sunUp, sunDown){
    const weatherUrl = `http://openweathermap.org/img/w/${weatherIcon}.png`
    const iconElement = `<img id="wicon" src="${weatherUrl}" alt="Weather Icon"></img>`

    $("#weather").html(`${weatherDescription}${iconElement}`)
    $("#temp").html(`Temperature: ${weatherTemp}&#8451`)
    $('#sunrise').html(`Sunrise: ${sunUp}`)
    $('#sunset').html(`Sunset: ${sunDown}`)
}

//Use iso code to fetch data from RestCountries API, uses currency code to get data from currency api:
function getFromRestCountries(iso) {
    var contactRestCountries = fetchAjax(
        'Back/RestCountries.php',
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
        $('#region > h6').html(`Region: ${result.data[0].region}`)

        getCurrencyInfo(currencyCode)
    }, function(error){
        console.log(error.responseText)
    })
}
//Utility function
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
    var contactOpenExchange = fetchAjax('Back/ExchangeRates.php',
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
//Load data from GeoJson file for country select in navigation menu:
$(document).ready(function(){
        var getGeoJson = fetchAjax(
            'Back/geoJsonQuery.php',
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
                    'Back/ForwardOpenCage.php',
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
                    getNews(currentCountryIso);
                    initialBoundingBox = JSON.parse(JSON.stringify(mapBorder.getBounds()))
        
                    getPlacesOfInterest(initialBoundingBox)
                    
                }, function (err){
                    console.error(err.responseText)
                }) 
            }
            );
        }, function(err){
            console.error(err.responseText);
        })

});

$("#layers").click(function (){
    markers.removelayer(featureData)
})


// CSS blur effect:
$(document).ready(function(){
    $(".mylinks").click(function (){
        $("#map, nav").css("filter","blur(25px)")
    })
    
    $('#map').mouseover(function(){
        $("#map, nav").css("filter","");
    })

    $('#map').on({'touchstart' : function(){
        $("#map, nav").css("filter","");
    }})

    $('.btn-close').click(function(){
        $("#map, nav").css("filter","");
    })
})
