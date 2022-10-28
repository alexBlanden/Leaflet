<?php

$apikey = 'YpGK6DiLKwdsdUcQ7L6P2oKM4AID3UgE';
$url = "https://api.apilayer.com/exchangerates_data/fluctuation?start_date=".$_REQUEST['startDate'].'&end_date='.$_REQUEST['endDate'].'&base=USD&symbols='.$_REQUEST['currencyCode'];

// Open CURL session:
$ch = curl_init();

curl_setopt($ch, CURLOPT_HTTPHEADER, array(
    "Content-Tpye: texy/plain",
    "apikey: $apikey"
));
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_URL, $url);

$result = curl_exec($ch);
curl_close($ch);



$decode = json_decode($result, true);


$output['status']['code'] = '200';
$output['status']['name'] = 'exchangeFluctuationResult';
$output['status']['description'] = 'success';
$output['data'] = $decode;

header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json; charset=UTF-8');


echo json_encode($output);

?>