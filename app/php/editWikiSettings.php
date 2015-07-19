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
    $use_versions = $_POST['use_versions'];
    $use_comments = $_POST['use_comments'];
    $use_anon = $_POST['use_anon'];
    $use_likes = $_POST['use_likes'];
    $add_pages = $_POST['add_pages'];
    $add_sections = $_POST['add_sections'];
    $max_posts = $_POST['max_posts'];

    $query = "UPDATE wikis SET use_versions='$use_versions', use_comments='$use_comments',
        use_anon='$use_anon', use_likes='$use_likes', add_pages='$add_pages',
        add_sections='$add_sections', max_posts='$max_posts'
      WHERE wiki_id='$wiki_id'";
    $result = $mysqli->query($query);
    $mysqli->close();
    echo json_encode($result);
}

?>