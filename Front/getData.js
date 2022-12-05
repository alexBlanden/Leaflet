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
    videos,
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
    console.log(result)
    //saves iso and country name from returned data
    let isoA2 = result.data.results[0].components.country_code.toUpperCase();

    $("#country_menu").val(isoA2).change();
    $('#map, #country_menu').show();
    $('#mapLoadingContainer').hide();
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
        console.log(result)
        $('#holidaysTable').show();
        $('#holidaysLoading').hide();
        $('#pastholidaysBody, #todayholidaysBody, #upcomingholidaysBody').html("");
        if(result.data == null){
            $('#pastholidaysBody').html(
                `<tr>
                    <td>
                    <td><p class="text-center">Sorry Holidays API Unavaiable in some locations</p></td>
                    <td>
                </tr>`
            )
        } else {
        const today = new Date()
        for(let i=0; i<result.data.length; i++){
            let counties = result.data[i].counties || 'National'
            let holidayDate = new Date(result.data[i].date)
            if(today > holidayDate){
            $('#pastholidaysBody').append(
                `<tr>
                    <td><p class="text-start text-muted">${result.data[i].name}<br>(${result.data[i].localName})</p></td>
                    <td><p class="text-start text-muted">${counties}</p></td>
                    <td><p class="text-end text-muted">${Date.parse(holidayDate).toString('d MMM')}</p></td>
              </tr>`
            )} else if (today == holidayDate) {
                $('#todayholidaysBody').append(
                    `<tr>
                    <td><p class="text-start">${result.data[i].name}<br>(${result.data[i].localName})</p></td>
                    <td><p class="text-start">${counties}</p></td>
                    <td><p class="text-end">${Date.parse(holidayDate).toString('d MMM')}</p></td>
                  </tr>`
            )} else {
                $('#upcomingholidaysBody').append(
                    `<tr>
                    <td><p class="text-start">${result.data[i].name}<br>(${result.data[i].localName})</p></td>
                    <td><p class="text-start">${counties}</p></td>
                    <td><p class="text-end">${Date.parse(holidayDate).toString('d MMM')}</p></td>
                  </tr>`
                )
            }
        }}
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
        console.log(result)
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
            <td><a href="${result.data.articles[i].url}" target="_BLANK">${result.data.articles[i].title}</a></td>
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
            let summary = result.data.geonames[i].summary.replace("(...)", "")
            resultAsJson.features.push(
                {
                    type: "Feature",
                    geometry: {
                        type: "Point",
                        coordinates: [result.data.geonames[i].lng, result.data.geonames[i].lat]
                    },
                    properties: {
                        name: result.data.geonames[i].title,
                        summary: summary,
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

        const infoMarker = L.ExtraMarkers.icon({
            // icon: 'fa-brands fa-wikipedia-w', <---Won't work :-/
            icon: 'fa-info-circle',
            iconColor: 'black',
            markerColor: 'white',
            shape: 'circle',
            prefix: 'fa',
            extraClasses: 'fa-lg'
          });

        //Take each feature in resultAsJson, add html and bind popup
        let featureData = L.geoJSON(resultAsJson, {
                onEachFeature: function (feature, layer) {
                    const content =
                    `
                    <h6 class="text-center fw-bold">${feature.properties.name}</h6>
                    <p>${feature.properties.summary}</p>
                    <a href="https://${feature.properties.link}" class="link-primary" target="_blank">Read More</a>
                    `
                    layer.bindPopup(content)
                },
                pointToLayer: function (feature, latlng) {
                    return L.marker(latlng, {icon: infoMarker});
                },
            });
            
        markers.addLayer(featureData);

        map.addLayer(markers);

    }, function(err){
        alert(`Error! ${err.responseText}`);
    })
}

function getCameras(iso){
    var cameraLocations = fetchAjax(
        `Back/windyCams.php`,
        {
            iso
        }
    );
    $.when(cameraLocations).then(function(result){
        console.log(result)
        var camsAsJson = {
            type: "FeatureCollection",
            features: [

            ]
        }

        camsAsJson.features.length = 0;

        for(let i= 0; i < result.data.result.webcams.length; i++){
            camsAsJson.features.push(
                {
                    type: "Feature",
                    geometry: {
                        type: "Point",
                        coordinates: [result.data.result.webcams[i].location.longitude, result.data.result.webcams[i].location.latitude]
                    },
                    properties: {
                        id: result.data.result.webcams[i].id,
                        name: result.data.result.webcams[i].title,
                        lifetimeCam: result.data.result.webcams[i].player.lifetime.embed,
                        monthCam: result.data.result.webcams[i].player.month.embed,
                        yearCam: result.data.result.webcams[i].player.year.embed
                    }
                },
            )
        }
        videos.clearLayers();

        const geojsonMarkerOptions = {
            radius: 8,
            fillColor: "#6d7280",
            color: "#000",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8
        };

        const camsMarker = L.ExtraMarkers.icon({
            icon: 'fa-camera',
            markerColor: 'black',
            shape: 'star',
            prefix: 'fa'
          });
        //Take each feature in resultAsJson, add html and bind popup
        let featureData = L.geoJSON(camsAsJson, {
                onEachFeature: function (feature, layer) {
                    const selectMenu = `<select id="${feature.properties.id}" class="form-select" aria-label="Default select example">
                    <option selected>Videos</option>
                    <option value="${feature.properties.lifetimeCam}">Day</option>
                    <option value="${feature.properties.yearCam}">Month</option>
                    <option value="${feature.properties.monthCam}">Year</option>
                    </select>`
                    const content = 
                    `
                    <div class="container-fluid">
                        <h6 class="text-center fw-bold">${feature.properties.name}</h6>
                        ${selectMenu}
                        <iframe src="" frameborder="0" id="video-${feature.properties.id}"></iframe>
                        </div>
                    </div>
                        `

                    const selectMenuId = $('#'+feature.properties.id)
                    layer.bindPopup(content)
                    $(selectMenuId).on('change', function () {
                        $("#video-"+feature.properties.id).attr('src', $("#"+feature.properties.id).val());
                    })
                },
                pointToLayer: function (feature, latlng) {
                    return L.marker(latlng, {icon: camsMarker});
                },
            });
            
        videos.addLayer(featureData);

        map.addLayer(videos);


    }, function (err){
        console.log(err.responseText)
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
        // $('#carouselInfo').text("")
        // $('#indicators').text("")
        
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
        $("#card-1").empty();
        $("#card-2").empty();
        console.log(result)
        //Populate weather info, first item is separate from smaller info cards
        let headlineDate = new Date(result.data.daily.time[0]);
        const units = result.data.daily_units.temperature_2m_max;
        let sunrise = new Date(result.data.daily.sunrise[0])
        let sunset = new Date(result.data.daily.sunset[0])
        //CSS for headline color is temp dependent
        let colour = "white, ";
        let midRange = (result.data.daily.temperature_2m_max[0] + result.data.daily.temperature_2m_min[0])/2
        // const headlineColorCss = `linear-gradient(to bottom right, white, ${colour})`;
        $('#headline-card').html(
            `<div class="card">
            <div class="card-body" id="headline-body">
              <h5 class="card-title">${Date.parse(headlineDate).toString("ddd dS MMM")}</h5>
              <span>
              <h5 class="card-text">${Math.round(result.data.daily.temperature_2m_max[0])}${units}</h5>
              <p>${Math.round(result.data.daily.temperature_2m_min[0])}</p>
              </span>
              <i id="hero-icon" class="wi wi-wmo4680-${result.data.daily.weathercode[0]}"></i> 
            </div>
            <div class="card-footer">
                <span><i class="wi wi-sunrise weather-icon-small"></i> ${sunrise.toLocaleTimeString("en-US", {
                    hour: '2-digit', minute: '2-digit'
                })}</span>
                <span>Rain: ${result.data.daily.rain_sum[0]}mm</span>
                <span><i class="wi wi-sunset weather-icon-footer"></i> ${sunset.toLocaleTimeString("en-US", {
                    hour: '2-digit', minute: '2-digit'
                })}</span>
            </div>
          </div>`
        )


        if(midRange> 38){
            //red
            colour += "red"
        }else if(midRange> 30){
            //orange
            colour += "orange"                
        }else if(midRange> 25){
            //orange-yellow
            colour += 'rgba(255, 181, 0, 1)'
        }else if(midRange> 18){
            //yellow
            colour += 'rgba(255, 255, 0, 1)'
        } else if (midRange>15){
            //yellow-green
            colour += 'rgba(171, 255, 0, 1)'
        } else if (midRange>10){
            //green
            colour += 'rgba(0, 255, 124, 1)'
        } else if (midRange>5){
            //green-blue
            colour +='rgba(0, 255, 192, 1)'    
        } else if (midRange>0) {
            //deep blue
            colour += 'rgba(0, 75, 255, 1)'   
        } else if(midRange < 0){
            //white
            colour += 'blue, white';
        }
        $('#headline-body').css('background-image', `linear-gradient(to bottom right, white, ${colour})`);

        for(let i=1; i<result.data.daily.time.length/2; i++){
            let date = new Date(result.data.daily.time[i])
            let date2 = new Date(result.data.daily.time[i+3])
            console.log(date);
            $('#card-1').append(
                `<div class="card" style="width: 18rem;">
                <div class="card-body">
                <div class="weather-text-container">
                  <h5 class="card-title">${Date.parse(date).toString("ddd dS")}</h5>
                  <span class="min-max-weather">
                  <p class="card-text"><strong>${Math.round(result.data.daily.temperature_2m_max[i])}${units}</strong></p>
                  <p class="card-text-min-temp">
                  ${Math.round(result.data.daily.temperature_2m_min[i])}${units}
                  </p>
                  </span>
                </div>
                  <i class="wi wi-wmo4680-${result.data.daily.weathercode[i]} weather-icon-small"></i>
                </div>
              </div>`
            )
            $('#card-2').append(
                `<div class="card" style="width: 18rem;">
                <div class="card-body">
                <div class="weather-text-container">
                <h5 class="card-title">${Date.parse(date2).toString("ddd dS")}</h5>
                <span class="min-max-weather">
                <p class="card-text"><strong>${Math.round(result.data.daily.temperature_2m_max[i+3])}${units}</strong></p>
                <p class="card-text-min-temp">
                  ${Math.round(result.data.daily.temperature_2m_min[i+3])}${units}
                  </p>
                  </span>
                </div>
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
        $("#country").html(`<h5>${result.data[0].name.common}</h5>`)
        $("#population").html(`<h6>${convertPopulationToString(result.data[0].population)}</h6>`)
        $("#capitalcity").html(`<h6>${result.data[0].capital}</h6>`)
        currencyCode = Object.keys(result.data[0].currencies)[0];
        currencySymbol = result.data[0].currencies[currencyCode].symbol
        currencyName = result.data[0].currencies[currencyCode].name
        var languageKey = Object.keys(result.data[0].languages)
        if(languageKey.length > 1){
            languages = result.data[0].languages[languageKey[0]]
        } else {
            languages = result.data[0].languages[languageKey]
        }
        $("#language").html(`<h6>${languages}</h6>`)
        $('#region').html(`<h6>${result.data[0].region}</h6>`)

        getCurrencyInfo(currencyCode, currencyName, currencySymbol)
        
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
        const num = parseFloat(Object.values(currencyValue)).toFixed(2);
        $("#currencyname").html(`<h4>Currency: ${currencyName}(${currencySymbol})</h4>`)
        $("#vsthedollar").html(`<h5>1 US Dollar is worth: ${currencySymbol}${num}</h5>`)
        $('#calc > div > label').html(`$ to ${currencySymbol} converter`)

        $('#calc-button').on('click',()=> {
            let number = $('#amount').val()
            $('#conversion').html(`<p class="fs-5 text">$${number} is worth ${currencySymbol}${number * num}</p>`)
            $('#conversion').show();
        })
        $('#currencyLoading').hide(1000);
        $('#currencyContainer').show(1000);
    }, function (error){
        console.log(error.responseText)
    })

}

export {
  getHolidays,
  getNews,
  getHealthExpenditure,
  getEduExpenditure,
  getMilitaryExpenditure,
  getPlacesOfInterest,
  getCameras,
  getWeather,
  getFiveDayForecast,
  getFromRestCountries,
  getCurrencyInfo,
  getDataFromCoordinates
}