<?php
session_start();
$_POST = json_decode(file_get_contents("php://input"), true);
if (isset($_POST['post_id'])) {
    include("advanced_user_oo.php");
    Define('DATABASE_SERVER', $hostname);
    Define('DATABASE_USERNAME', $username);
    Define('DATABASE_PASSWORD', $password);
    Define('DATABASE_NAME', 'wiki');

    $mysqli = new mysqli(DATABASE_SERVER, DATABASE_USERNAME, DATABASE_PASSWORD, DATABASE_NAME);
    $wiki_id = $_SESSION['wiki_id'];
    $post_id = $_POST['post_id'];
    $micro_date = $_POST['micro_date'];
    $micro_id = $_POST['micro_id'];
    $user_id = $_POST['user_id'];
    $query = "DELETE FROM micro_posts
        WHERE post_id='$post_id' AND micro_id='$micro_id' AND micro_date='$micro_date' AND wiki_id='$wiki_id' AND user_id='$user_id'";
    $result = $mysqli->query($query);
    $mysqli->close();
    echo json_encode($result);
}

?>