<?php
session_start();
$_POST = json_decode(file_get_contents("php://input"), true);
if (isset($_SESSION['wiki_id'])) {
    include("advanced_user_oo.php");
    Define('DATABASE_SERVER', $hostname);
    Define('DATABASE_USERNAME', $username);
    Define('DATABASE_PASSWORD', $password);
    Define('DATABASE_NAME', 'wiki');

    class WikiPage {
        var $res = [];
    }

    $wiki_page = new WikiPage();

    $mysqli = new mysqli(DATABASE_SERVER, DATABASE_USERNAME, DATABASE_PASSWORD, DATABASE_NAME);
    $wiki_id = $_SESSION['wiki_id'];
    $priv_level = $_SESSION['priv_level'];
    $term = $mysqli->real_escape_string($_POST['term']);

    $query = "SELECT p.page_id, p.post_id, p.version, p.creator_id, p.heading_id, p.creation_date, p.edit_date, p.post_txt, p.prev,
        IF((p.is_anon='1' AND '$priv_level'<2),'anonymous',u.user_name) as user_name, g.page_name, h.heading_name,
        IF((p.is_anon='1' AND '$priv_level'<2),'anonymous',uc.user_name) as commentor, c.user_id AS commentor_id, comment_txt,
        comment_date, comment_id,
        (SELECT COUNT(*) FROM likes l WHERE l.post_id=p.post_id) AS likes
    FROM posts p
    INNER JOIN users u
      ON u.user_id=p.creator_id
    INNER JOIN pages g
      ON g.page_id=p.page_id
    INNER JOIN headings h
      ON h.heading_id=p.heading_id
    LEFT JOIN comments c
      ON c.post_id=p.post_id
    LEFT JOIN users uc
      ON uc.user_id=c.user_id
    WHERE p.wiki_id='$wiki_id' AND (post_txt LIKE '%$term%' OR comment_txt LIKE '%$term%')
    ORDER BY g.page_name, p.heading_id, prev, post_id, version ASC, comment_id ASC";
    $result = $mysqli->query($query);
    $json = array();
    while ($row = $result->fetch_assoc()) {
        $json[] = $row;
    }
    $wiki_page->res = $json;

    $result->close();
    $mysqli->close();
    echo json_encode($wiki_page);
}

?>