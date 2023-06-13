<?php
    $input = json_decode(file_get_contents('php://input'), true);
    
    $host = "192.168.10.103"; //host is the same as the web server
    $dbname = "alert-test"; //CHANGE THIS DATABASE NAME //name of the database want to connect php to
    $username = "arec"; //additional username //areltGenerator originally //use root account to connect - use only recommended when develop locally
    $password = "arec";//additional password//CHANGED THIS from empty password to dietpi //password is left empty

    $conn = mysqli_connect($host,
                            $username,
                            $password,
                            $dbname);
    if (mysqli_connect_error())  {// make sure connecgt okay, return error code from most recent connection attempt, if no error, returns zero, if eror occurs return a script
        die("Connection error(): " . mysqli_connect_error()); //browser connecting at http://localhost/websitephp/processForm.php
    }
    
    $sql = "UPDATE message SET resolved = ? WHERE id = ?";
            
    $stmt = mysqli_stmt_init($conn);//create a prepared statement object

    if ( ! mysqli_stmt_prepare($stmt, $sql)) {
        die(mysqli_error($conn));
    }

    mysqli_stmt_bind_param($stmt,"ii", //string of types for the different variables for the second parameter
                            $input['resolved'], $input['id']);//s

    mysqli_stmt_execute($stmt);
    echo "Record saved.";

    $response = array('status' => 'success');
    echo json_encode($response);
?>