<?php
$filename= uniqid('temp-', true) . '.json';
if (isset($_POST["program"])) {
    file_put_contents($filename,$_POST["program"]);


echo json_encode(array('filename'=>$filename));
}
?>