<?php


$app_id = 'db91db74a2034b4a95632e22ee956a69';
$url = "https://openexchangerates.org/api/latest.json?app_id=" . $app_id . "&symbols=" . $_REQUEST['currencyCode'];

// Open CURL session:
$ch = curl_init();
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_URL, $url);

$result = curl_exec($ch);
curl_close($ch);



$decode = json_decode($result, true);


$output['status']['code'] = '200';
$output['status']['name'] = 'openExchangeResult';
$output['status']['description'] = 'success';
$output['data'] = $decode;

header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json; charset=UTF-8');


echo json_encode($output);
?>