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
    $subscribed = $_POST['subscribed'];
    $user_id = $_POST['user_id'];
    $wiki_id = $_SESSION['wiki_id'];

    $query = "UPDATE wiki_users SET subscribed='$subscribed' WHERE user_id='$user_id' AND wiki_id='$wiki_id'; ";
    $result = $mysqli->query($query);
    $mysqli->close();
    echo json_encode($result);
}

?>