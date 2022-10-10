<?php

$countryBordersFileContent = file_get_contents("./countryBorders.geo.json");
$decode = json_decode($countryBordersFileContent, true);

$iso_and_coordinates = [];

$requested_country = strtoupper($_REQUEST['iso']);
$length = count($decode['features']);

for($i=0; $i < $length; $i++){
    if($decode['features'][$i]['properties']['iso_a2'] == $requested_country){
        array_push(
            $iso_and_coordinates,
            array(
                "iso_a2" => $decode['features'][$i]['properties']['iso_a2'],
                "coordinates" => $decode['features'][$i]['geometry']
            )
        );
    }
}


$output['status']["code"] = "200";
$output['status']["name"] = "ok";
$output["data"] = $iso_and_coordinates;


header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json; charset=UTF-8');



echo json_encode($output);

?>