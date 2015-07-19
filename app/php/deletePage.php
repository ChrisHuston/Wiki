<?php
$_POST = json_decode(file_get_contents("php://input"), true);
if (isset($_POST['page_id'])) {
    include("advanced_user_oo.php");
    Define('DATABASE_SERVER', $hostname);
    Define('DATABASE_USERNAME', $username);
    Define('DATABASE_PASSWORD', $password);
    Define('DATABASE_NAME', 'wiki');

    $mysqli = new mysqli(DATABASE_SERVER, DATABASE_USERNAME, DATABASE_PASSWORD, DATABASE_NAME);
    $page_id = $_POST['page_id'];
    $query = "DELETE FROM posts WHERE page_id='$page_id'; ";
    $query .= "DELETE FROM headings WHERE page_id='$page_id'; ";
    $query .= "DELETE FROM pages WHERE page_id='$page_id'; ";
    $result = $mysqli->multi_query($query);

    $mysqli->close();
    echo json_encode($result);
}

?>