<?php
session_start();
$_POST = json_decode(file_get_contents("php://input"), true);
if (isset($_SESSION['wiki_id'])) {
    include("advanced_user_oo.php");
    Define('DATABASE_SERVER', $hostname);
    Define('DATABASE_USERNAME', $username);
    Define('DATABASE_PASSWORD', $password);
    Define('DATABASE_NAME', 'wiki');

    class DbRes {
        var $headings = [];
        var $posts = [];
    }

    $mysqli = new mysqli(DATABASE_SERVER, DATABASE_USERNAME, DATABASE_PASSWORD, DATABASE_NAME);

    $res = new DbRes();
    $wiki_id = $_SESSION['wiki_id'];
    if (isset($_POST['admin_only'])) {
        $admin_only = $_POST['admin_only'];
    } else {
        $admin_only = 0;
    }


    $query = "SELECT heading_id, page_id, heading_name FROM headings WHERE wiki_id='$wiki_id'; ";

    if ($admin_only == '1') {
        $query .= "SELECT p.post_id, p.version, p.creator_id, p.heading_id, p.creation_date, p.edit_date, p.post_txt, p.prev, u.user_id, u.user_name, u.user_email
    FROM posts p
    INNER JOIN users u
      ON u.user_id=p.creator_id
	INNER JOIN wiki_users w
		ON w.user_id=u.user_id AND w.wiki_id=p.wiki_id AND w.priv_level>1
    WHERE p.wiki_id='$wiki_id' AND p.version='1'
    ORDER BY p.page_id, p.heading_id, p.prev, p.post_id, p.version DESC";
    } else {
        $query .= "SELECT p.post_id, p.version, p.creator_id, p.heading_id, p.edit_date, p.post_txt, p.prev, u.user_id, u.user_name, u.user_email
    FROM posts p
    INNER JOIN users u
      ON u.user_id=p.creator_id
INNER JOIN (SELECT post_id, MAX(version) AS max_version FROM posts GROUP BY post_id) m
	ON m.post_id=p.post_id AND m.max_version=p.version
    WHERE wiki_id='$wiki_id'
    ORDER BY p.page_id, p.heading_id, p.prev, p.post_id, p.version DESC";
    }

    $mysqli->multi_query($query);

    $mysqli->next_result();
    $result = $mysqli->store_result();
    $json = array();
    while ($row = $result->fetch_assoc()) {
        $json[] = $row;
    }
    $res->headings = $json;


    $mysqli->next_result();
    $result = $mysqli->store_result();
    $json = array();
    while ($row = $result->fetch_assoc()) {
        $json[] = $row;
    }
    $res->posts = $json;

    $result->close();
    $mysqli->close();
    echo json_encode($res);
}

?>