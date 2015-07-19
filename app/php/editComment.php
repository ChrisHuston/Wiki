<?php
session_start();
$_POST = json_decode(file_get_contents("php://input"), true);
if ($_SESSION['wiki_id']) {
    include("advanced_user_oo.php");
    Define('DATABASE_SERVER', $hostname);
    Define('DATABASE_USERNAME', $username);
    Define('DATABASE_PASSWORD', $password);
    Define('DATABASE_NAME', 'wiki');

    $mysqli = new mysqli(DATABASE_SERVER, DATABASE_USERNAME, DATABASE_PASSWORD, DATABASE_NAME);
    $post_id = $_POST['post_id'];
    $comment_id = $_POST['comment_id'];
    $user_id = $_POST['user_id'];
    $wc = $_POST['wc'];
    $is_anon = $_POST['is_anon'];
    $comment_txt = $mysqli->real_escape_string($_POST['comment_txt']);

    $query = "UPDATE comments SET comment_txt='$comment_txt', wc='$wc', is_anon='$is_anon', comment_date=UTC_TIMESTAMP()
    WHERE post_id='$post_id' AND comment_id='$comment_id' AND user_id='$user_id'";
    $result = $mysqli->query($query);
    $mysqli->close();
    echo $result;
}

?>