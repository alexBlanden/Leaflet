import {
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
    //Leaflet Variables
    mapBorder,
    markers,
    map
} from './script.js';

import {
    convertPopulationToString
} from './utils.js';


var fetchAjax = function (address, query) {
    return $.ajax({
        url: address,
        type: "GET",
        dataType: "json",
        data: query
    });
}

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
    const isoA2 = result.data.results[0].components.country_code;
    $("#country_menu").val(initialLocationData.isoA2).change();
}, function(err){
    console.error(`Error:${err.responseText}`)
});
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
    }, function (err){
        console.log(err.responseText);
    })
}

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

function getPlacesOfInterest(bbox){
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
    $.when(contactOpenWeather).then(function (result){
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
        console.log(result)
        var currencyName;
        var currencySymbol;
        var currencyCode;
        var languages;
        var boundingBox = {};
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

        getCurrencyInfo(currencyCode, currencyName, currencySymbol)
        getCurrencyFluctuation(currencyCode)
        
        $('#countryBody').show(1000);
        $('#factsloading').hide(1000);
    
    }, function(error){
        console.log(error.responseText)
    })
}

function getCurrencyInfo(currencyCode, currencyName, currencySymbol){
    $('#currencyLoading').show(1000);
    $('#currencyContainer').hide();

    var contactOpenExchange = fetchAjax('Back/ExchangeRates.php',
    {
        currencyCode
    }
    );
    $.when(contactOpenExchange).then(function(result){
        console.log(result)
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

export {
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
}