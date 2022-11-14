<?php
//Store JSON in variable
$countryBordersFileContent = file_get_contents("./countryBorders.geo.json");
//Convert json to associative array
$decode = json_decode($countryBordersFileContent, true);

$iso_and_coordinates = [];

$requested_country = strtoupper($_REQUEST['iso']);

//Prepare for loop
$length = count($decode['features']);

//If country code from countryBorders.geo.json matches requested country, add code and border coordinates to array: 
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