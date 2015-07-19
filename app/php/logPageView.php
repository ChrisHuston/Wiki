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
    $net_id = $_POST['net_id'];

    $query = "INSERT INTO page_views
			(wiki_id, net_id, page_id, view_date) VALUES
			('$wiki_id', '$net_id', '$page_id', UTC_TIMESTAMP()); ";
    $result = $mysqli->query($query);
    $mysqli->close();
}

?>