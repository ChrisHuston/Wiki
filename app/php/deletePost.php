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
    $version = $_POST['version'];
    $creator_id = $_POST['creator_id'];
    $query = "DELETE FROM posts
    WHERE post_id='$post_id' AND version='$version' AND creator_id='$creator_id' AND wiki_id='$wiki_id'";
    $result = $mysqli->query($query);
    if ($version == 1) {
        $query = "DELETE FROM micro_posts
            WHERE post_id='$post_id' AND wiki_id='$wiki_id'";
        $mysqli->query($query);
    }
    $mysqli->close();
    echo json_encode($result);
}

?>