<?php
session_start();
$_POST = json_decode(file_get_contents("php://input"), true);
if (isset($_SESSION['priv_level'])) {
    if ($_SESSION['priv_level']>1) {
        include("advanced_user_oo.php");
        Define('DATABASE_SERVER', $hostname);
        Define('DATABASE_USERNAME', $username);
        Define('DATABASE_PASSWORD', $password);
        Define('DATABASE_NAME', 'wiki');

        $mysqli = new mysqli(DATABASE_SERVER, DATABASE_USERNAME, DATABASE_PASSWORD, DATABASE_NAME);
        $heading_id = $_POST['heading_id'];
        $query = "DELETE FROM posts WHERE heading_id='$heading_id'; ";
        $query .= "DELETE FROM headings WHERE heading_id='$heading_id'; ";
        $result = $mysqli->multi_query($query);
        $mysqli->close();
        echo json_encode($result);
    } else {
        echo json_encode($_SESSION['priv_level']);
    }
}

?>