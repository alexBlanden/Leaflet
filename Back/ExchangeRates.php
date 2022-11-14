<?php

require __DIR__ . '/vendor/autoload.php';
$dotenv = \Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

$app_id = $_ENV['open_exchange_id'];

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