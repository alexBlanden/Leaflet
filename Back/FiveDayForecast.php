<?php

ini_set('display_errors', 'On');
error_reporting(E_ALL);

$rawData = file_get_contents('./country-capitals.json');
$cityList = json_decode($rawData, true);

$cityLat = "";
$cityLng = "";

$requestedCountry = strtoupper($_REQUEST['iso']);

//Prepare for loop
$length = count($cityList);

//If country code from country-capitals.json matches requested country, prepare variables for cURL: 
for($i=0; $i < $length; $i++){
    if($cityList[$i]['CountryCode'] == $requestedCountry){
        $cityLat = $cityList[$i]['CapitalLatitude'];
        $cityLng = $cityList[$i]['CapitalLongitude'];
        break;
    // } else {
    //     $output['status']['code'] = '400';
    //     $output['status']['name'] = 'fiveDayWeatherResult';
    //     $output['status']['description'] = 'Bad Request';
    //     $output['data'] = 'Error, no country matches the provided ISO code';

    //     header('Access-Control-Allow-Origin: *');
    //     header('Content-Type: application/json; charset=UTF-8');
    }
}
$url = 'https://api.open-meteo.com/v1/forecast?latitude='.$cityLat.'&longitude='.$cityLng.'&daily=weathercode,temperature_2m_max,sunrise,sunset,rain_sum&timezone=auto';

$ch = curl_init();
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_URL, $url);

$result = curl_exec($ch);
curl_close($ch);


$decode = json_decode($result, true);


$output['status']['code'] = '200';
$output['status']['name'] = 'weatherQueryResult';
$output['status']['description'] = 'success';
$output['data'] = $decode;

header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json; charset=UTF-8');

echo json_encode($output);

?>