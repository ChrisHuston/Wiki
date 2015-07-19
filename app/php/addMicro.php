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
    $user_id = $_POST['user_id'];
    $wc = $_POST['wc'];
    $micro_id = $_POST['micro_id'];
    $micro_txt = $mysqli->real_escape_string($_POST['micro_txt']);

    $query = "INSERT INTO micro_posts
			(wiki_id, page_id, heading_id, post_id, micro_id, wc, is_anon, user_id, micro_txt, micro_date) VALUES
			('$wiki_id', '$page_id', '$heading_id', '$post_id', '$micro_id', '$wc', '$is_anon', '$user_id', '$micro_txt', UTC_TIMESTAMP()); ";
    $result = $mysqli->query($query);
    $mysqli->close();
    echo json_encode($result);
}

?>