<?php


ini_set('display_errors', 'On');
error_reporting(E_ALL);

$url = 'https://restcountries.com/v3.1/alpha/'.$_REQUEST['iso'];    

//Curl Session:
$ch = curl_init();
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_URL, $url);

$result = curl_exec($ch);
curl_close($ch);


$decode = json_decode($result, true);


$output['status']['code'] = '200';
$output['status']['name'] = 'restCountriesAPI';
$output['status']['description'] = 'success';
$output['data'] = $decode;

header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json; charset=UTF-8');

// print_r($_REQUEST);

echo json_encode($output);

?>