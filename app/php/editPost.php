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
    $version = $_POST['version'];
    $wc = $_POST['wc'];
    $is_anon = $_POST['is_anon'];
    $post_txt = $mysqli->real_escape_string($_POST['post_txt']);

    if ($_POST['update_date'] == '1') {
        $query = "UPDATE posts SET post_txt='$post_txt', wc='$wc', is_anon='$is_anon', edit_date=UTC_TIMESTAMP()
    WHERE post_id='$post_id' AND version='$version'";
    } else {
        $query = "UPDATE posts SET post_txt='$post_txt', wc='$wc', is_anon='$is_anon'
    WHERE post_id='$post_id' AND version='$version'";
    }

    $result = $mysqli->query($query);
    $mysqli->close();
    echo $result;
}

?>