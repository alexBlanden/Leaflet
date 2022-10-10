<?php


ini_set('display_errors', 'On');
error_reporting(E_ALL);

// // Require additional classes using Composer and use Dotenv to easily load environment variables and access API keys from .env file:
require __DIR__ . '/vendor/autoload.php';
$dotenv = \Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();


$apiKey= 'b3f3ea23e99c413fa4e6f6da8f889f38';

$url = "http://newsapi.org/v2/top-headlines?country=" . $_REQUEST['country'] . "&apiKey=" . $apiKey;


//Curl Session:

$ch = curl_init();
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_URL, $url);

$result = curl_exec($ch);
curl_close($ch);


$decode = json_decode($result, true);


$output['status']['code'] = '200';
$output['status']['name'] = 'newsQueryResult';
$output['status']['description'] = 'success';
$output['data'] = $decode;

header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json; charset=UTF-8');


echo json_encode($output);

?>