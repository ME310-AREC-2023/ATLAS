<?php
// Connect to MariaDB
$logPath = 'error.log';
ini_set('error_log', $logPath);
error_reporting(E_ALL);

$db = new mysqli('192.168.10.103', 'alertGenerator', 'ME310arec', 'alert-test', 3306);

// Check connection
if ($db->connect_error) {
    die("Connection failed: " . $db->connect_error);
}

// Define your SQL query
$sql = "SELECT * FROM message";

// Execute the query
$result = $db->query($sql);

// Fetch the data from the result
$data = [];
if ($result->num_rows > 0) {
    // output data of each row
    while($row = $result->fetch_assoc()) {
        $data[] = $row;
    }
} else {
    echo "0 results";
}

// Convert the data to JSON and print it
header('Content-type:application/json;charset=utf-8');
echo json_encode($data, JSON_PRETTY_PRINT);

// Close the connection
$db->close();
?>