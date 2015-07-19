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
    $query = "DELETE p FROM posts p
        INNER JOIN wiki_users u
            ON u.user_id=p.creator_id AND u.priv_level='1' AND u.user_id>'0'
        WHERE p.wiki_id='$wiki_id'";
    $result = $mysqli->query($query);
    $mysqli->close();
    echo json_encode($result);
}

?>