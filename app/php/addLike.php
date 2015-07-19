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
    $post_id = $_POST['post_id'];
    $user_id = $_POST['user_id'];

    $query = "INSERT INTO likes
			(wiki_id, post_id, user_id) VALUES
			('$wiki_id', '$post_id', '$user_id'); ";
    $result = $mysqli->query($query);
    $affected_rows = $mysqli->affected_rows;
    $mysqli->close();
    echo json_encode($affected_rows);
}

?>