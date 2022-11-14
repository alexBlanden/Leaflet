<?php


ini_set('display_errors', 'On');
error_reporting(E_ALL);





$url = "https://date.nager.at/api/v3/PublicHolidays/".$_REQUEST['year'] .'/'. $_REQUEST['iso'];


//Curl Session:

$ch = curl_init();
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
// curl_setopt($ch, CURLOPT_USERAGENT, $_SERVER['HTTP_USER_AGENT']);
curl_setopt($ch, CURLOPT_URL, $url);

$result = curl_exec($ch);
curl_close($ch);


$decode = json_decode($result, true);

$output['status']['code'] = '200';
$output['status']['name'] = 'holidaysQueryResult';
$output['status']['description'] = 'success';
$output['data'] = $decode;


header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json; charset=UTF-8');


echo json_encode($output);

?>