<?php

ini_set('display_errors', 'On');
error_reporting(E_ALL);



$url='http://api.geonames.org/wikipediaSearchJSON?q=' .$_REQUEST['searchTerm'] . '&maxRows=3&username=blanden';


// Prepare curl session and store returned data as json in $decode variable:

$ch = curl_init();
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_URL, $url);

$result = curl_exec($ch);

curl_close($ch);

$decode = json_decode($result, true);

$output['status']['code'] = "200";
$output['status']['name'] = "wikiOk";
$output['status']['description'] = "success";
$output['data'] = $decode['geonames'];


header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json; charset=UTF-8');

echo json_encode($output);
?>