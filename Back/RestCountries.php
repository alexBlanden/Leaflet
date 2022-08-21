<?php


ini_set('display_errors', 'On');
error_reporting(E_ALL);

// // Require additional classes using Composer and use Dotenv to easily load environment variables and access API keys from .env file:
require __DIR__ . '\vendor\autoload.php';
$dotenv = \Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

// $map_tiler_API = $_ENV['map_tiler_API'];

// $open_cage_API = $_ENV['open_cage_API'];

// //Url with api key visible for testing purposes:
$url = 'https://restcountries.com/v3.1/alpha/'.$_REQUEST['iso'];    

        // ______________________


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

// print_r($_REQUEST);

echo json_encode($output);

?>