<?php

ini_set('display_errors', 'On');
error_reporting(E_ALL);


$map_tiler_API = "";

$open_cage_API = "";


$url = 'https://api.opencagedata.com/geocode/v1/json?q=-23.5373732,-46.8374628&pretty=1&key=' . $open_cage_API;

$ch = curl_init();
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_URL, $url);

$result = curl_exec($ch);

$decode = json_decode($result, true);

$output['status']['code'] = '200';
$output['status']['name'] = 'queryResult';
$output['status']['description'] = 'success';
$output['data'] = $decode;

header('Content-Type: application/json; charset=UTF-8');

echo json_encode($output);