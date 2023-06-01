<?php
// Enable error reporting
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
$logPath = 'error.log';
ini_set('error_log', $logPath);
ini_set('memory_limit', '256M'); // Set memory limit to 256MB
error_reporting(E_ALL);

require 'vendor/autoload.php';

use InfluxDB2\Client;
use InfluxDB2\Model\WritePrecision;

$client = new Client([
    "url" => "http://192.168.10.105:8086",
    "token" => "Rh39GCH6_aXbIt507ePLLPVkrSSE7QQpDd8T_Pevoj2i2VQMG45LPXf7-kHDITlSmlcr7N2P66C1ybGpYNvL0Q==",
    "org" => "AREC 22-23",
    "bucket" => "SensorBox-test"
]);

// get the input data
$input = json_decode(file_get_contents('php://input'), true);

// print input data to the error log
//error_log(print_r($input, true));

// Fetch data from InfluxDB and parse it into an associative array
// $data = fetch and parse data...

$queryApi = $client->createQueryApi();

// Construct your query using the input data. Here I'm just adding the type to the query, 
// you would need to adjust this to match your actual query.
$query = sprintf('from(bucket: "SensorBox-test") 
                |> range(start: %s, stop: %s)
                |> filter(fn: (r) => r["_measurement"] == "SensorBox")
                |> filter(fn: (r) => r["host"] == "DietPi")
                |> filter(fn: (r) => r["_field"] == "%s")
                |> filter(fn: (r) => r["topic"] == "%s")                
                |> aggregateWindow(every: %ss, fn: mean, createEmpty: false)
                |> yield(name: "mean")', $input['startTime'], $input['endTime'], $input['type'], $input['location'], $input['timeInterval']);

// print the query to the error log
//error_log("Query: " . $query);

$data = $queryApi->query($query, "AREC 22-23");

// print query result to the error log
// error_log("Query result: " . print_r($data, true));

// Send JSON response
header('Content-Type: application/json');
echo json_encode($data);
?>
