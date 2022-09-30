<?php


ini_set('display_errors', 'On');
error_reporting(E_ALL);

// Require additional classes using Composer and use Dotenv to easily load environment variables and access API keys from .env file:
require __DIR__ . '/vendor/autoload.php';
$dotenv = \Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

$openCageAPI = $_ENV['open_cage_API'];

// //Plain Url for tsting purposes:
$url = 'https://api.opencagedata.com/geocode/v1/json?q='.$_REQUEST['currentCountryName'].'&key='.$openCageAPI;   

//Curl Session:

$ch = curl_init();
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_URL, $url);

$result = curl_exec($ch);
curl_close($ch);


$decode = json_decode($result, true);


$output['status']['code'] = '200';
$output['status']['name'] = 'openCageForwardQueryResult';
$output['status']['description'] = 'success';
$output['data'] = $decode;

header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json; charset=UTF-8');


echo json_encode($output);

?>