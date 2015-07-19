<?php
session_start();
if (isset($_SESSION['wiki_id'])) {
    require_once('advanced_user_oo.php');
    Define('DATABASE_SERVER', $hostname);
    Define('DATABASE_USERNAME', $username);
    Define('DATABASE_PASSWORD', $password);
    Define('DATABASE_NAME', 'wiki');
    $mysqli = new mysqli(DATABASE_SERVER, DATABASE_USERNAME, DATABASE_PASSWORD, DATABASE_NAME);

    $server_root = $_SERVER['DOCUMENT_ROOT'];
    $media_path = urldecode($_POST['media_path']);
    $media_path = $server_root.$media_path;
    if (!@is_dir($media_path)) {
        @mkdir($media_path, 0755,true);
    }
    $media_name = $_POST['media_name'];
    $media_file = $media_path."/".$media_name;
    $upload_result = move_uploaded_file($_FILES['qqfile']['tmp_name'], $media_file);

    if ($upload_result) {
        $user_id = $_POST['user_id'];
        $wiki_id = $_SESSION['wiki_id'];
        $page_id = $_POST['page_id'];
        $heading_id = $_POST['heading_id'];
        $type_id = $_POST['type_id'];
        $query = "INSERT INTO user_uploads (user_id, type_id, wiki_id, page_id, heading_id, file_name, upload_date) VALUES
			('$user_id', '$type_id', '$wiki_id', '$page_id', '$heading_id', '$media_name', UTC_TIMESTAMP())
			ON DUPLICATE KEY UPDATE file_name='$media_name'";
        $result = $mysqli->query($query);
        if ($result) {
            $status = array('success'=>true);
        } else {
            $status = array('error'=> 'Could not add data to database.' .
                'The upload was cancelled, or server error encountered', 'path'=>$media_path);
        }
    } else {
        $status = array('error'=> 'Could not save uploaded file.' .
            'The upload was cancelled, or server error encountered', 'path'=>$media_path);
    }
    $mysqli->close();
    echo htmlspecialchars(json_encode($status), ENT_NOQUOTES);
}
?>