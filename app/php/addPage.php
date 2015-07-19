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
        var $page_id = 0;
    }

    $mysqli = new mysqli(DATABASE_SERVER, DATABASE_USERNAME, DATABASE_PASSWORD, DATABASE_NAME);
    $wiki_id = $_SESSION['wiki_id'];
    $creator_id = $_POST['creator_id'];
    $page_name = $mysqli->real_escape_string($_POST['page_name']);

    $query = "INSERT INTO pages
			(wiki_id, creator_id, page_name, creation_date, prev) VALUES
			('$wiki_id', '$creator_id', '$page_name', UTC_TIMESTAMP(), 0); ";
    $result = $mysqli->query($query);
    $post_data = new PostData();
    $post_data->page_id = $mysqli->insert_id;
    $mysqli->close();
    echo json_encode($post_data);
}

?>