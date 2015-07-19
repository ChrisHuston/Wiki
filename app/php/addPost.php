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
    $post_id = $_POST['post_id'];
    $is_anon = $_POST['is_anon'];
    $heading_id = $_POST['heading_id'];
    $creator_id = $_POST['creator_id'];
    $wc = $_POST['wc'];
    $post_txt = $mysqli->real_escape_string($_POST['post_txt']);

    $query = "SELECT IFNULL(MAX(version),0) AS version FROM posts WHERE post_id='$post_id' AND heading_id='$heading_id'";
    $result = $mysqli->query($query);
    list($version) = $result->fetch_row();
    $version = $version + 1;

    $query = "INSERT INTO posts
			(wiki_id, page_id, heading_id, post_id, version, wc, is_anon, creator_id, post_txt, creation_date, edit_date, prev) VALUES
			('$wiki_id', '$page_id', '$heading_id', '$post_id', '$version', '$wc', '$is_anon', '$creator_id', '$post_txt', UTC_TIMESTAMP(), UTC_TIMESTAMP(), 0); ";
    $result = $mysqli->query($query);
    $mysqli->close();
    echo json_encode($result);
}

?>