<?php


$wikiDataList = $_REQUEST['wikiData'];

$wikipediaUrls = [];

foreach($wikiDataList as $wikiCode){
    $url='http://www.wikidata.org/entity/'.$wikiCode;
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_URL, $url);

    $result = curl_exec($ch);

    curl_close($ch);
    array_push(
        $wikipediaUrls,
        array(
            "wikiDataKey" => $result["entities"][$wikiCode]["sitelinks"]['enwiki']['url'],
            "wikiCode" => $wikiCode
        )
    );
}

$output['status']["code"] = "200";
$output['status']["name"] = "ok";
$output["data"] = $wikipediaUrls;


header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json; charset=UTF-8');

echo json_encode($output);

?>