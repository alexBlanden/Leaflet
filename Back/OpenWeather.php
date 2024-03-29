<?php


ini_set('display_errors', 'On');
error_reporting(E_ALL);

// // Require additional classes using Composer and use Dotenv to easily load environment variables and access API keys from .env file:
require __DIR__ . '/vendor/autoload.php';
$dotenv = \Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

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

$openWeather = $_ENV['open_weather_id'];


// $url = 'https://api.openweathermap.org/data/2.5/forecast?lat='. $_REQUEST['latitude'].'&lon='.$_REQUEST['longitude'].'&units=metric&appid='.$openWeather;  

$url = 'https://api.openweathermap.org/data/2.5/forecast?lat='. $cityLat.'&lon='.$cityLng.'&units=metric&appid='.$openWeather;



//Curl Session:


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