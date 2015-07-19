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
    $micro_id = $_POST['micro_id'];
    $micro_date = $_POST['micro_date'];
    $user_id = $_POST['user_id'];
    $wc = $_POST['wc'];
    $is_anon = $_POST['is_anon'];
    $micro_txt = $mysqli->real_escape_string($_POST['micro_txt']);

    if ($_POST['update_date'] == '1') {
        $query = "UPDATE micro_posts SET micro_txt='$micro_txt', wc='$wc', is_anon='$is_anon', micro_date=UTC_TIMESTAMP()
    WHERE post_id='$post_id' AND micro_id='$micro_id' AND micro_date='$micro_date' AND user_id='$user_id'";
    } else {
        $query = "UPDATE micro_posts SET micro_txt='$micro_txt', wc='$wc', is_anon='$is_anon'
    WHERE post_id='$post_id' AND micro_id='$micro_id' AND micro_date='$micro_date' AND user_id='$user_id'";
    }

    $result = $mysqli->query($query);
    $mysqli->close();
    echo $result;
}

?>