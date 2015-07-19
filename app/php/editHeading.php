<?php
$_POST = json_decode(file_get_contents("php://input"), true);
if (isset($_POST['heading_id'])) {
    include("advanced_user_oo.php");
    Define('DATABASE_SERVER', $hostname);
    Define('DATABASE_USERNAME', $username);
    Define('DATABASE_PASSWORD', $password);
    Define('DATABASE_NAME', 'wiki');

    $mysqli = new mysqli(DATABASE_SERVER, DATABASE_USERNAME, DATABASE_PASSWORD, DATABASE_NAME);
    $heading_id = $_POST['heading_id'];
    $heading_name = $mysqli->real_escape_string($_POST['heading_name']);

    $query = "UPDATE headings SET heading_name='$heading_name' WHERE heading_id='$heading_id'; ";
    $result = $mysqli->query($query);
    $mysqli->close();
    echo json_encode($result);
}

?>