<?php


ini_set('display_errors', 'On');
error_reporting(E_ALL);

// // Require additional classes using Composer and use Dotenv to easily load environment variables and access API keys from .env file:
require __DIR__ . '\vendor\autoload.php';
$dotenv = \Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

// $map_tiler_API = $_ENV['map_tiler_API'];

// $open_cage_API = $_ENV['open_cage_API'];


$maxLat = $_REQUEST['bbox']['northeast']['lat'];
$minLat = $_REQUEST['bbox']['southwest']['lat'];

$maxLng = $_REQUEST['bbox']['northeast']['lng'];
$minLng = $_REQUEST['bbox']['southwest']['lng'];

$url = 'https://api.opentripmap.com/0.1/en/places/bbox?lon_min='.$minLng.'&lon_max='.$maxLng.'&lat_min='.$minLat.'&lat_max='.$maxLat.'&limit=20&apikey=5ae2e3f221c38a28845f05b648fd673fc25eff16db05ce748bf5683f';


//Curl Session:

$ch = curl_init();
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_URL, $url);

$result = curl_exec($ch);
curl_close($ch);


$decode = json_decode($result, true);


$output['status']['code'] = '200';
$output['status']['name'] = 'openTripMapResult';
$output['status']['description'] = 'success';
$output['data'] = $decode;

header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json; charset=UTF-8');

// echo (json_encode($_REQUEST['bbox']))
echo json_encode($output);

?>