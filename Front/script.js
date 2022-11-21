var fetchAjax = function (address, query) {
    return $.ajax({
        url: address,
        type: "GET",
        dataType: "json",
        data: query
    });
}

//Loading screen while waiting for user location
$('#map, #country_menu').hide();
$('#mapLoadingContainer').show();

//Create Leaflet map
var map = L.map("map");
var mapStyle = {
    "fillColor": "#999595",
    "weight": 3,
    "opacity": 0.7,
    "color": "black",
    "dashArray": "20,10,5,5,5,10"
}

var currencyName;
var currencySymbol;
var currencyCode;
var languages;
var boundingBox = {};

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

var mapBorder = null;
let markers = L.markerClusterGroup();
//Create Bootstrap 5 modals for country info
var countryModal = new bootstrap.Modal($('#countryModal'));
var weatherModal = new bootstrap.Modal($('#weatherModal'));
var newsModal = new bootstrap.Modal($('#newsModal'));
var currencyModal = new bootstrap.Modal($('#currencyModal'));
var holidaysModal = new bootstrap.Modal($('#holidaysModal'));
var worldBankModal = new bootstrap.Modal($('#worldBankModal'));

//Weather Chart and Chart Data
const timeOfDay = [];
const temperature = [];
const bgroundColor = [];

const ctxWeather = $('#weatherChart');
const weatherChart = new Chart(ctxWeather, {
    type: 'line',
    data: {
        labels: timeOfDay,
        datasets: [{
            label: 'Temp in Celcius',
            data: temperature,
            backgroundColor: bgroundColor,
            borderWidth: 1
        }]
    },
    options: {
        animations: {
            tension: {
                duration: 1000,
                easing: 'linear',
                from: 1,
                to: 0,
                loop: true
            }
        },
        scales: {
            y: {
                beginAtZero: false
            }
        }
    }
})

//Health Expenditure Chart and chart data
const healthExpenditureDate = [];
const healthExpenditureValue = [];

const ctxHealth = $('#healthChart');
const healthChart = new Chart(ctxHealth, {
    type: 'line',
    data: {
        labels: healthExpenditureDate,
        datasets: [{
            label: 'Health',
            data: healthExpenditureValue,
            borderWidth: 2,
            borderColor: 'red',
            fill: false,
        }]
    },
    options: {
        responsive: true,
        plugins: {
            title: {
                display: true,
            },
            legend: {
                labels: {
                    usePointStyle: true,
                }
            }
        },
        interaction: {
            intersect: false,
        },
        scales: {
            x: {
                display: true,
                title: {
                    display: true,
                    text: 'Year',
                }
            },
            y: {
                display: true,
                title: {
                    display: true,
                    text: "%",
                    font: {
                        weight: 'bold'
                    },
                },
                beginAtZero: true,
            }
        }
    }
})

//Education Expenditure Chart and chart data
const eduExpenditureDate = [];
const eduExpenditureValue = [];

const ctxEdu = $('#eduChart');
const eduChart = new Chart(ctxEdu, {
    type: 'line',
    data: {
        labels: eduExpenditureDate,
        datasets: [{
            label: 'Education',
            data: eduExpenditureValue,
            borderWidth: 2,
            borderColor: 'blue',
            fill: false,
        }]
    },
    options: {
        responsive: true,
        plugins: {
            title: {
                display: true,
            },
            legend: {
                labels: {
                    usePointStyle: true,
                }
            }
        },
        interaction: {
            intersect: false,
        },
        scales: {
            x: {
                display: true,
                title: {
                    display: true,
                    text: 'Year',
                }
            },
            y: {
                display: true,
                title: {
                    display: true,
                    text: "% of GPD",
                    font: {
                        weight: 'bold'
                    },
                },
                beginAtZero: true,
            }
        }
    }
})

//Military Expenditure Chart and chart data
const militaryExpenditureDate = [];
const militaryExpenditureValue = [];

const ctxMil = $('#militaryChart');
const militaryChart = new Chart(ctxMil, {
    type: 'line',
    data: {
        labels: militaryExpenditureDate,
        datasets: [{
            label: 'Military',
            data: militaryExpenditureValue,
            borderWidth: 2,
            borderColor: 'green',
            fill: false,
        }]
    },
    options: {
        responsive: true,
        plugins: {
            title: {
                display: true,
            },
            legend: {
                labels: {
                    usePointStyle: true,
                }
            }
        },
        interaction: {
            intersect: false,
        },
        scales: {
            x: {
                display: true,
                title: {
                    display: true,
                    text: 'Year',
                }
            },
            y: {
                display: true,
                title: {
                    display: true,
                    text: "%",
                    font: {
                        weight: 'bold'
                    },
                },
                beginAtZero: true,
            }
        }
    }
})



//If user location known, load as appropriate. 
const success = (position) => {
    $('#mapLoadingContainer').hide();
    $('#map, #country_menu').show();
    //assign initial location data coordinates
    initialLocationData.lat =  position.coords.latitude;
    initialLocationData.lng = position.coords.longitude;

    loadLocation()
    loadEasyButtons();

    // getWeather(initialLocationData.lat,initialLocationData.lng);
    getDataFromCoordinates(initialLocationData.lat,initialLocationData.lng);
}

//If not, default to Brussels.
const fail = () => {
    loadMap();
    getWeather('BE');
    drawInitialCountryBorders('BE');
    loadEasyButtons();
    getNews('BE');
    getFromRestCountries('BE');
    $("#drives > h6").html(`Drive on the right`);

}

function loadEasyButtons () {
    L.easyButton('fa-globe', function(btn, map) {
        countryModal.toggle();
    }).addTo(map)

    L.easyButton('fa-sun', function (btn, map){
        weatherModal.toggle();
    }).addTo(map)

    L.easyButton('fa-dollar-sign', function (btn, map){
        currencyModal.toggle();
    }).addTo(map)

    L.easyButton("fa-newspaper", function(btn, map){
        newsModal.toggle();
    }).addTo(map)

    L.easyButton('fa-calendar', function (btn, map){
        holidaysModal.toggle();
    }).addTo(map)

    L.easyButton('fa-info', function (btn, map){
        worldBankModal.toggle();
    }).addTo(map);


}
//Use Navigator object method to determine user's latitude and longitude
navigator.geolocation.getCurrentPosition(success, fail)


function loadMap () {
    $('#mapLoadingContainer').hide();
    $('#map, #country_menu').show();
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
        .bindPopup(`Location unknown! Use the buttons on the left to find out more`).openPopup();
        L.circle([lat, lng], {radius: 500}).addTo(map);
    
}

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
        .bindPopup(`Found you! Use the buttons on the left to find out more`).openPopup();
        L.circle([lat, lng], {radius: 500}).addTo(map);
}

function getHolidays (iso) {
    $('#holidaysLoading').show();
    $('#holidaysTable').hide();
    
    const today = new Date();
    const year = today.getFullYear();
    var contactHolidaysAPI = fetchAjax(
        'Back/holidaysAPI.php',
        {
            iso,
            year
        }
    );
    $.when(contactHolidaysAPI).then(function(result){
        $('#holidaysTable').show();
        $('#holidaysLoading').hide();
        const months = ['Jan', 'Feb', 'March', 'April', 'May', 'Jun', 'Jul', 'August', 'Sept', 'Oct', 'Nov', 'Dec']
       
        console.log(result);
        const today = new Date()
        $('#pastholidaysBody, #todayholidaysBody, #upcomingholidaysBody').html("");
        for(let i=0; i<result.data.length; i++){
            let counties = result.data[i].counties || 'National'
            let holidayDate = new Date(result.data[i].date)
            if(today > holidayDate){
            $('#pastholidaysBody').append(
                `<tr>
                <th scope="row">${i+1}</th>
                <td>${result.data[i].name} (${counties})</td>
                <td>${result.data[i].localName}</td>
                <td>${result.data[i].types[0]}</td>
                <td>${holidayDate.getDate()}-${months[holidayDate.getMonth()]}</td>
              </tr>`
            )} else if (today == holidayDate) {
                $('#todayholidaysBody').append(
                    `<tr>
                    <th scope="row">${i+1}</th>
                    <td>${result.data[i].name} (${counties})</td>
                    <td>${result.data[i].localName}</td>
                    <td>${result.data[i].types[0]}</td>
                    <td>${holidayDate.getDate()}-${months[holidayDate.getMonth()]}</td>
                  </tr>`
            )} else {
                $('#upcomingholidaysBody').append(
                    `<tr>
                    <th scope="row">${i+1}</th>
                    <td>${result.data[i].name} (${counties})</td>
                    <td>${result.data[i].localName}</td>
                    <td>${result.data[i].types[0]}</td>
                    <td>${holidayDate.getDate()}-${months[holidayDate.getMonth()]}</td>
                  </tr>`
                )
            }
        }
    })
}

//News sotries API data used to populate table in news modal.
function getNews(iso){
    $('#newsloading').show();
    $('#newsTable').hide();
    var contactNewsAPI = fetchAjax(
        'Back/newsAPI.php',
        {
            iso
        }
    );
    $.when(contactNewsAPI).then(function (result){
        //Clear previous entries
        $('#newsBody').html("")
        //Service not available in all countries
        if(!result.data.articles.length){
            $('#newsBody').html("<tr><td></td><td>Sorry, news service unavailable in some destinations</td><td></td></tr>")
        }
        //Iterate over articles array and append info to relevant section of newsModal
        for(let i= 0; i<result.data.articles.length; i++){
        $('#newsBody').append(
            `<tr>
            <th scope="row">${i+1}</th>
            <td>${result.data.articles[i].title}</td>
            <td><a href="${result.data.articles[i].url}" target="_BLANK">${result.data.articles[i].source.name}</a></td>
          </tr>`
        )}

    $('#newsTable').show(1000);
    $('#newsloading').hide(1000);

    }, function (error) {
        console.log(error.responseText)
    })
}

function getHealthExpenditure(iso){
    $('#healthChart').hide();
    var contactWorldBankHealth = fetchAjax(
        'Back/WorldBankHealthData.php',
        {
            iso
        }
    );
    $.when(contactWorldBankHealth).then(function (result){
        healthExpenditureDate.length = 0;
        healthExpenditureValue.length = 0;
        for(let i=0; i<result.data.length; i++){
            healthExpenditureDate.push(result.data[i].date);
            healthExpenditureValue.push(result.data[i].value);
        }
        healthChart.update();
        console.log(result);
        $('#healthChart').show();
    }, function (err){
        console.log(err.responseText);
    })
}

function getEduExpenditure(iso){
    $('#educhart').hide();
    var contactWorldBankEdu = fetchAjax(
        'Back/WorldBankEducationData.php',
        {
            iso
        }
    );
    $.when(contactWorldBankEdu).then(function (result){
        eduExpenditureDate.length = 0;
        eduExpenditureValue.length = 0;
        for(let i=0; i<result.data.length; i++){
            eduExpenditureDate.push(result.data[i].date);
            eduExpenditureValue.push(result.data[i].value);
        }
        eduChart.update();
        console.log(result);
        $('#educhart').show();
    }, function (err){
        console.log(err.responseText);
    })
}

function getMilitaryExpenditure(iso){
    $('#militaryChart').hide();
    var contactWorldBankMilitary = fetchAjax(
        'Back/WorldBankMilitaryData.php',
        {
            iso
        }
    );
    $.when(contactWorldBankMilitary).then(function (result) {
        militaryExpenditureDate.length = 0;
        militaryExpenditureValue.length = 0;
        for(let i=0; i<result.data.length; i++){
            militaryExpenditureDate.push(result.data[i].date);
            militaryExpenditureValue.push(result.data[i].value);
        }
        militaryChart.update();
        $('#militaryChart').show();
        console.log(result);
    })
}

//Determines country & country ISO code from user coordinates & uses data to fetch news items, country borders and general country facts. 
function getDataFromCoordinates(lat,lng) {
    var contactOpenCage = fetchAjax(
    'Back/OpenCage.php',
    {
        lat,
        lng
    }
);
$.when(contactOpenCage).then(function(result){
    //saves iso and country name from returned data
    initialLocationData.isoA2 = result.data.results[0].components.country_code;
    initialLocationData.countryName = result.data.results[0].components.state;
    $("#country_menu").val(initialLocationData.isoA2).change();
    //Populate
    $("#drives > h6").html(`Drive on the ${result.data.results[0].annotations.roadinfo.drive_on}`);

    getWeather(initialLocationData.isoA2);
    getFiveDayForecast(initialLocationData.isoA2);
    getFromRestCountries(initialLocationData.isoA2);
    getNews(initialLocationData.isoA2);
    drawInitialCountryBorders(initialLocationData.isoA2);
    getHolidays(initialLocationData.isoA2);
    getHealthExpenditure(initialLocationData.isoA2);
    getEduExpenditure(initialLocationData.isoA2);
    getMilitaryExpenditure(initialLocationData.isoA2);
}, function(err){
    console.error(`Error:${err.responseText}`)
});
}

//initialCountryBorders uses Leaflet getBounds method to determine boundaries needed for places of interest markers.
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
        let initialBoundingBox = JSON.parse(JSON.stringify(mapBorder.getBounds()))
        getPlacesOfInterest(initialBoundingBox) 
    }, function(err){
        console.log(err.responseText);
    })
}

//Countries selected from dropdown menu use iso code to determine boundaries needed for places of interest.
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
        // map.flyToBounds(boundingBox)
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
        //API is temperamental
        if(!result.data.geonames || result.data.status == 13){
            markers.clearLayers();
            alert("Sorry Places of interest API unavailable. Please try again.")
        }
        //result needs to be geoJson
        var resultAsJson = {
            type: "FeatureCollection",
            features: [

            ]
        }

        resultAsJson.features.length = 0;
            
        
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
       markers.clearLayers();
            
        const geojsonMarkerOptions = {
            radius: 8,
            fillColor: "#6d7280",
            color: "#000",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8
        };
        //Take each feature in resultAsJson, add html and bind popup
        let featureData = L.geoJSON(resultAsJson, {
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
            
        markers.addLayer(featureData);

        map.addLayer(markers);

    }, function(err){
        alert(`Error! ${err.responseText}`);
    })
}

//Uses coordinates to get weather info for lat/lng
function getWeather(iso) {
    $('#weatherInfo').hide()
    $('#weatherLoading').show()
    var contactOpenWeather = fetchAjax (
        'Back/OpenWeather.php',
        {
            // latitude,
            // longitude
            iso
        }
    );
    $.when(contactOpenWeather).then(function(result){
        console.log(result);
        $('#carouselInfo').text("")
        $('#indicators').text("")
        //Clear arrays used for weatherChart:
        timeOfDay.length = 0;
        temperature.length = 0;
        bgroundColor.length = 0;
        const daysOfTheWeek = ["Sun", "Mon", "Tues", "Weds", "Thurs", "Fri", "Sat"]
        
        //Iterate over result array and append bootstrap info cards to bootstrap carousel in weather modal. Cards added in pairs:
        for(let i = 0; i<result.data.list.length; i++){
            let date = new Date(result.data.list[i].dt * 1000);
            if(i == 0){
                timeOfDay.push(`${daysOfTheWeek[date.getDay()]} ${date.getDate()}`)
                temperature.push(result.data.list[i].main.temp)
                i++
            }

            if(date.toLocaleTimeString("en-GB") == '03:00:00'){
                timeOfDay.push(`${daysOfTheWeek[date.getDay()]} ${date.getDate()}`);
            } else{
                timeOfDay.push(date.toLocaleTimeString("en-US", {
                    hour: '2-digit', minute: '2-digit'
                }));
            }
            
            temperature.push(result.data.list[i].main.temp)
            
           
        }
        //Create color scheme for temperature chart
        for(let i=0; i<temperature.length; i++){
            if(temperature[i]> 38){
                //red
                bgroundColor.push('rgba(255, 0, 0, 1)')
            }else if(temperature[i]> 30){
                //orange
                bgroundColor.push('rgba(255, 113, 0, 1')                
            }else if(temperature[i]> 25){
                //orange-yellow
                bgroundColor.push('rgba(255, 181, 0, 1)')
            }else if(temperature[i]> 18){
                //yellow
                bgroundColor.push('rgba(255, 255, 0, 1)')
            } else if (temperature[i]>15){
                //yellow-green
                bgroundColor.push('rgba(171, 255, 0, 1)')
            } else if (temperature[i]>10){
                //green
                bgroundColor.push('rgba(0, 255, 124, 1)')
            } else if (temperature[i]>5){
                //green-blue
                bgroundColor.push('rgba(0, 255, 192, 1)')     
            } else if (temperature[i]>0) {
                //deep blue
                bgroundColor.push('rgba(0, 75, 255, 1)')    
            } else if(temperature[i] < 0){
                //white
                bgroundColor.push('rgba(107, 107, 255, 0.18)')
            }
        }
        //Update weathercahrt when new data is pushed to arrays
        weatherChart.update();
        $('#weatherLoading').hide();
        $('#weatherInfo').show();
    }, function(error){
        console.error(error.responseText);
    })
    
}

function getFiveDayForecast (iso) {
    var contactOpenMeteo = fetchAjax(
        'Back/FiveDayForecast.php',
        {
            iso
        }
    );
    $.when(contactOpenMeteo).then(function (result){
        console.log(result)
        //Populate weather info, first item is separate from smaller info cards
        let headlineDate = new Date(result.data.daily.time[0]);
        let month = headlineDate.toLocaleString('default', { month: 'short' });
        const units = result.data.daily_units.temperature_2m_max;
        let sunrise = new Date(result.data.daily.sunrise[0])
        let sunset = new Date(result.data.daily.sunset[0])
        $('#headline-card').html(
            `<div class="card">
            <div class="card-body">
              <h5 class="card-title">${headlineDate.getDate()} ${month}</h5>
              <h5 class="card-text">${result.data.daily.temperature_2m_max[0]}${units}</h5>
              <i id="hero-icon" class="wi wi-wmo4680-${result.data.daily.weathercode[0]}"></i> 
            </div>
            <div class="card-footer">
                <span><i class="wi wi-sunrise weather-icon-small"></i> ${sunrise.toLocaleTimeString("en-US", {
                    hour: '2-digit', minute: '2-digit'
                })}</span>
                <span>Rain: ${result.data.daily.rain_sum[0]}mm</span>
                <span><i class="wi wi-sunset weather-icon-small"></i> ${sunset.toLocaleTimeString("en-US", {
                    hour: '2-digit', minute: '2-digit'
                })}</span>
            </div>
          </div>`
        )

        for(let i=1; i<result.data.daily.time.length/2; i++){
            let date = new Date(result.data.daily.time[i])
            let month = date.toLocaleString('default', { month: 'short' });
            let date2 = new Date(result.data.daily.time[i+3])
            let month2 = date2.toLocaleString('default', { month: 'short' });
            console.log(date);
            $('#card-1').append(
                `<div class="card" style="width: 18rem;">
                <div class="card-body">
                  <h5 class="card-title">${date.getDate()} ${month}</h5>
                  <p class="card-text">${result.data.daily.temperature_2m_max[i]}${units}</p>
                  <i class="wi wi-wmo4680-${result.data.daily.weathercode[i]} weather-icon-small"></i>
                </div>
              </div>`
            )
            $('#card-2').append(
                `<div class="card" style="width: 18rem;">
                <div class="card-body">
                <h5 class="card-title">${date2.getDate()} ${month2}</h5>
                <p class="card-text">${result.data.daily.temperature_2m_max[i+3]}${units}</p>
                <i class="wi wi-wmo4680-${result.data.daily.weathercode[i+3]} weather-icon-small"></i>
                </div>
              </div>`
            )
        }
    }, function (err){
        console.log(err)
    })
}

//Use iso code to fetch data from RestCountries API, uses currency code to get data from currency api:
function getFromRestCountries(iso) {
    $('#factsloading').show()
    $('#countryBody').hide()
    var contactRestCountries = fetchAjax(
        'Back/RestCountries.php',
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
        $("#population > h6").html(`Population: ${convertPopulationToString(result.data[0].population)}`)
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
        getCurrencyFluctuation(currencyCode)
        
        $('#countryBody').show(1000);
        $('#factsloading').hide(1000);
    
    }, function(error){
        console.log(error.responseText)
    })
}
//Utility function
function convertPopulationToString(number) {
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
    $('#currencyLoading').show(1000);
    $('#currencyContainer').hide();

    var contactOpenExchange = fetchAjax('Back/ExchangeRates.php',
    {
        currencyCode
    }
    );
    $.when(contactOpenExchange).then(function(result){
        const currencyValue = result.data.rates
        $("#currencyname").html(`<h4>Currency: ${currencyName}(${currencySymbol})</h4>`)
        $("#vsthedollar").html(`<h5>1 US Dollar is worth: ${currencySymbol}${Object.values(currencyValue)}</h5>`)

        $('#currencyLoading').hide(1000);
        $('#currencyContainer').show(1000);
    }, function (error){
        console.log(error.responseText)
    })

}

function getCurrencyFluctuation(currencyCode){
    //Create date to show currency fluctuation over the past year:
    const monthsOfTheYear = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    let today = new Date()
    let day = today.getDate()
    let month = today.getMonth()
    //Set date format for API
    if(day.toString().length == 1){
        day = `0${day}`
    }
    if(month.toString().length == 1){
        month = `0${month}`
    }
    let year = today.getFullYear()
    let lastYear = year-1

    let startDate = `${lastYear}-${month}-${day}`
    let endDate = `${year}-${month}-${day}`

    var contactExchangeApi = fetchAjax(
        'Back/ExchangeRateFluctuation.php',
    {
        currencyCode,
        startDate,
        endDate
    }
    );
    $.when(contactExchangeApi).then(function (result){
        console.log(result)
        $('#conversion').html(`Since ${day} of ${monthsOfTheYear[today.getMonth()]} last year the ${currencyCode} has fluctuated in value against the US Dollar by ${Math.abs(result.data.rates[currencyCode].change_pct)}%`)
    }, function (err) {
        console.log(err.responseText);
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
            console.log(result)
            for(let i= 0; i < result.data.length; i++){
                $('#country_menu').append(
                    `<option class="country_menu_select" value="${result.data[i].iso_a2}">${result.data[i].name}</option>`)   
            }
            $("#country_menu").change(function(){
                //Value made up of iso code and name of country
                var countryVal = $('#country_menu').val()
                countrySelectData.countryIso = countryVal;
                const currentCountryIso = countrySelectData.countryIso;
                const currentCountryName = encodeURI($("#country_menu option:selected").text());
                // countrySelectData.countryName = countryVal.name;
                // const countrySelect = countryVal.name;

                drawCountryBorders(currentCountryIso);
                getHolidays(currentCountryIso);
                
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
                    getWeather(currentCountryIso);
                    getFromRestCountries(currentCountryIso)
                    getNews(currentCountryIso);
                    getHolidays(currentCountryIso);

                    getHealthExpenditure(currentCountryIso);
                    getEduExpenditure(currentCountryIso);
                    getMilitaryExpenditure(currentCountryIso);
                    let initialBoundingBox = JSON.parse(JSON.stringify(mapBorder.getBounds()))
        
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