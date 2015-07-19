<?php
session_start();
$_POST = json_decode(file_get_contents("php://input"), true);
if (isset($_SESSION['wiki_id'])) {
    include("advanced_user_oo.php");
    Define('DATABASE_SERVER', $hostname);
    Define('DATABASE_USERNAME', $username);
    Define('DATABASE_PASSWORD', $password);
    Define('DATABASE_NAME', 'wiki');

    class PostData {
        var $heading_id = 0;
    }

    $mysqli = new mysqli(DATABASE_SERVER, DATABASE_USERNAME, DATABASE_PASSWORD, DATABASE_NAME);
    $wiki_id = $_SESSION['wiki_id'];
    $page_id = $_POST['page_id'];
    $creator_id = $_POST['creator_id'];
    $heading_name = $mysqli->real_escape_string($_POST['heading_name']);

    $query = "INSERT INTO headings
			(wiki_id, page_id, creator_id, heading_name, creation_date, prev) VALUES
			('$wiki_id', '$page_id', '$creator_id', '$heading_name', UTC_TIMESTAMP(), 0); ";
    $result = $mysqli->query($query);
    $post_data = new PostData();
    $post_data->heading_id = $mysqli->insert_id;
    $mysqli->close();
    echo json_encode($post_data);
}

?>