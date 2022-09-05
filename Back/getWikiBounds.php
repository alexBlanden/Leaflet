<?php


ini_set('display_errors', 'On');
error_reporting(E_ALL);

// // Require additional classes using Composer and use Dotenv to easily load environment variables and access API keys from .env file:
require __DIR__ . '\vendor\autoload.php';
$dotenv = \Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

// $map_tiler_API = $_ENV['map_tiler_API'];

// $open_cage_API = $_ENV['open_cage_API'];


//Maximum and Minimum Latitude and Longitude required for bounds box
$north = $_REQUEST['bbox']['northeast']['lat'];
$south = $_REQUEST['bbox']['southwest']['lat'];

$east = $_REQUEST['bbox']['northeast']['lng'];
$west = $_REQUEST['bbox']['southwest']['lng'];

$url = 'http://api.geonames.org/wikipediaBoundingBoxJSON?north='.$north.'&south='.$south.'&east='.$east.'&west='.$west.'&username=blanden';


//Curl Session:

$ch = curl_init();
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_URL, $url);

$result = curl_exec($ch);
curl_close($ch);


$decode = json_decode($result, true);


$output['status']['code'] = '200';
$output['status']['name'] = 'wikiBoundsResult';
$output['status']['description'] = 'success';
$output['data'] = $decode;

header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json; charset=UTF-8');

// echo (json_encode($_REQUEST['bbox']))
echo json_encode($output);

?>