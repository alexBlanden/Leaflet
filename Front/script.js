import {
    getHolidays,
    getNews,
    getHealthExpenditure,
    getEduExpenditure,
    getMilitaryExpenditure,
    getPlacesOfInterest,
    getWeather,
    getFiveDayForecast,
    getFromRestCountries,
    getCurrencyInfo,
    getCurrencyFluctuation,
    getDataFromCoordinates
} from './getData.js';



var fetchAjax = function (address, query) {
    return $.ajax({
        url: address,
        type: "GET",
        dataType: "json",
        data: query
    });
}

$('#map, #country_menu').hide();
$('#mapLoadingContainer').show();

//Create Leaflet map
var map = L.map("map").fitWorld();
var mapStyle = {
    "fillColor": "#999595",
    "weight": 3,
    "opacity": 0.7,
    "color": "black",
    "dashArray": "20,10,5,5,5,10"
}

var languages;
var boundingBox = {};

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

//Add countries to country select menu
function populateSelectMenu () {
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
    });   
        
}

function loadMap () {
    console.log('loading map')
    $('#mapLoadingContainer')
    L.tileLayer('https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=gce3UfFmnaOupUCQzm4b',
    {
    maxZoom: 19,
    attribution: '<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>',
    style: 'https://api.maptiler.com/maps/basic-v2/style.json?key=gce3UfFmnaOupUCQzm4b'
    }).addTo(map);
}

function drawCountryBorders (iso) {
    console.log(`start`)
    var countryBorders = fetchAjax(
        `Back/geoJsonCoordinates.php`,
        {iso}
    );$.when(countryBorders).then(function (result){
        console.log(result)
        //Check for previous selected country's border
        if(mapBorder){
            mapBorder.remove()
        }

        mapBorder = L.geoJson(result.data[0].coordinates, {style: 
            mapStyle
        }).addTo(map)
        //Center map view on newly selected country
        boundingBox = mapBorder.getBounds();
        console.log(boundingBox);
        map.flyToBounds(boundingBox)

        let initialBoundingBox = JSON.parse(JSON.stringify(mapBorder.getBounds()))
        getPlacesOfInterest(initialBoundingBox);
        
    }, function (error){
        console.log(error.responseText)
    })
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

navigator.geolocation.getCurrentPosition(success, fail);

function success (position) {
    const lat =  position.coords.latitude;
    const lng = position.coords.longitude;

    getDataFromCoordinates(lat, lng)
}

function fail () {
    
}

$(document).ready(function (){
    populateSelectMenu();
    loadMap();
    loadEasyButtons();
    $('#map, #country_menu').show();
    $('#mapLoadingContainer').hide();
})
$('#country_menu').change(function () {
    let countryIso = $('#country_menu').val();
    let countryName = encodeURI($("#country_menu option:selected").text());

    drawCountryBorders(countryIso);
    getHolidays(countryIso)
    getNews(countryIso)
    getHealthExpenditure(countryIso)
    getEduExpenditure(countryIso)
    getMilitaryExpenditure(countryIso)
    getWeather(countryIso)
    getFiveDayForecast(countryIso)
    getFromRestCountries(countryIso)
    getCurrencyInfo(countryIso)
    getCurrencyFluctuation(countryIso)    

})


export {
    //Weather
    timeOfDay,
    bgroundColor,
    temperature,
    weatherChart,
    //Health Expenditure
    healthExpenditureDate,
    healthExpenditureValue,
    healthChart,
    //Education Expenditure
    eduExpenditureDate,
    eduExpenditureValue,
    eduChart,
    //Military Expenditure
    militaryExpenditureDate,
    militaryExpenditureValue,
    militaryChart,
    //Leaflet variables
    mapBorder,
    markers,
    map
}