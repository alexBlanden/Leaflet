<?php


ini_set('display_errors', 'On');
error_reporting(E_ALL);

// // Require additional classes using Composer and use Dotenv to easily load environment variables and access API keys from .env file:
require __DIR__ . '/vendor/autoload.php';
$dotenv = \Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();


$apiKey= $_ENV['news_api'];

$url = "http://newsapi.org/v2/top-headlines?country=" . $_REQUEST['iso'] . "&apiKey=" . $apiKey;


//Curl Session:

$ch = curl_init();
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_USERAGENT, $_SERVER['HTTP_USER_AGENT']);
curl_setopt($ch, CURLOPT_URL, $url);

$result = curl_exec($ch);
curl_close($ch);


$decode = json_decode($result, true);

//Object keys need to be lowercase

function array_change_key_case_recursive($arr)
{
    return array_map(function($item){
        if(is_array($item))
            $item = array_change_key_case_recursive($item);
        return $item;
    },array_change_key_case($arr));
}

$new_array = array_change_key_case_recursive($decode);



$output['status']['code'] = '200';
$output['status']['name'] = 'newsQueryResult';
$output['status']['description'] = 'success';
$output['data'] = $new_array;

header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json; charset=UTF-8');
// https://alexblanden.co.uk

echo json_encode($output);

?>