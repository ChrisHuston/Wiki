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
    $comment_id = $_POST['comment_id'];
    $heading_id = $_POST['heading_id'];
    $page_id = $_POST['page_id'];
    $user_id = $_POST['user_id'];
    $wc = $_POST['wc'];
    $is_anon = $_POST['is_anon'];
    $comment_txt = $mysqli->real_escape_string($_POST['comment_txt']);

    $query = "INSERT INTO comments
			(wiki_id, post_id, heading_id, page_id, comment_id, wc, user_id, comment_txt, is_anon, comment_date) VALUES
			('$wiki_id', '$post_id', '$heading_id', '$page_id', '$comment_id', '$wc', '$user_id', '$comment_txt', '$is_anon', UTC_TIMESTAMP()); ";
    $result = $mysqli->query($query);
    $mysqli->close();
    echo json_encode($result);
}

?>