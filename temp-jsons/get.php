<?php
if (isset($_GET["filename"])) 
    $content = file_get_contents($_GET["filename"]);

echo json_encode(array('msg'=>$content));

?>