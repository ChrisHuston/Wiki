<?php
session_start();
$_POST = json_decode(file_get_contents("php://input"), true);
if (isset($_SESSION['wiki_id'])) {
    include("advanced_user_oo.php");
    Define('DATABASE_SERVER', $hostname);
    Define('DATABASE_USERNAME', $username);
    Define('DATABASE_PASSWORD', $password);
    Define('DATABASE_NAME', 'wiki');

    $mysqli = new mysqli(DATABASE_SERVER, DATABASE_USERNAME, DATABASE_PASSWORD, DATABASE_NAME);
    $wiki_id = $_SESSION['wiki_id'];
    $logo_link = $mysqli->real_escape_string($_POST['logo_link']);

    $query = "UPDATE wikis SET logo_link='$logo_link' WHERE wiki_id='$wiki_id'";
    $result = $mysqli->query($query);
    $mysqli->close();
    echo json_encode($result);
}

?>