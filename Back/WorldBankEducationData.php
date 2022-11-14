<?php

$educationExpenditure = [];

$requested_country = strtoupper($_REQUEST['iso']);

//url fetches health expenditure for requested country as % of GDP for the 5 most recent non empty values
$url = 'https://api.worldbank.org/v2/country/'.$requested_country.'/indicator/SE.XPD.TOTL.GD.ZS?format=json&mrnev=5';

$ch = curl_init();
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_URL, $url);

$result = curl_exec($ch);
curl_close($ch);


$decode = json_decode($result, true);

//Prepare for loop
$length = count($decode[1]);

//data is returned with most recent year first, for loop works backwards to avoid sorting array values later
for($i=$length -1; $i >= 0; $i--){
    array_push(
        $educationExpenditure,
        array(
            "date" => $decode[1][$i]['date'],
            "value" => $decode[1][$i]['value']
        )
    );
}


$output['status']["code"] = "200";
$output['status']["name"] = "education expenditure";
$output["data"] = $educationExpenditure;


header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json; charset=UTF-8');



echo json_encode($output);

?>