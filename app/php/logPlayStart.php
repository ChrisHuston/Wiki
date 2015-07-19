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

    $query = "INSERT INTO video_view_log
			(wiki_id, page_id, user_id, videoFile, view_date, duration, view_times) VALUES
			('$wiki_id', '$page_id', '$user_id', '$videoFile', UTC_TIMESTAMP(), '0', '1')
			ON DUPLICATE KEY UPDATE view_times=(view_times+1), last_date=UTC_TIMESTAMP(); ";
    $result = $mysqli->query($query);
    $mysqli->close();
    echo json_encode($result);
}

?>