<?php
$_POST = json_decode(file_get_contents("php://input"), true);
if (isset($_POST['page_id'])) {
    include("advanced_user_oo.php");
    Define('DATABASE_SERVER', $hostname);
    Define('DATABASE_USERNAME', $username);
    Define('DATABASE_PASSWORD', $password);
    Define('DATABASE_NAME', 'wiki');

    $mysqli = new mysqli(DATABASE_SERVER, DATABASE_USERNAME, DATABASE_PASSWORD, DATABASE_NAME);
    $page_id = $_POST['page_id'];
    $page_name = $mysqli->real_escape_string($_POST['page_name']);

    $query = "UPDATE pages SET page_name='$page_name' WHERE page_id='$page_id'; ";
    $result = $mysqli->query($query);
    $mysqli->close();
    echo json_encode($result);
}

?>