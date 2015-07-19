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
    $page_id = $_POST['page_id'];
    $videoFile = $_POST['videoFile'];
    $user_id = $_POST['user_id'];
    $duration = $_POST['duration'];

    $query = "UPDATE video_view_log SET duration=(duration+'$duration'), last_date=UTC_TIMESTAMP()
    WHERE user_id='$user_id' AND wiki_id='$wiki_id' AND page_id='$page_id' AND videoFile='$videoFile'";
    $result = $mysqli->query($query);
    $mysqli->close();
    echo json_encode($result);
}

?>