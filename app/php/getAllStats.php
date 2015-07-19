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
        var $users = [];
        var $posts = [];
        var $comments = [];
        var $headings = [];
    }

    $mysqli = new mysqli(DATABASE_SERVER, DATABASE_USERNAME, DATABASE_PASSWORD, DATABASE_NAME);

    $wiki_page = new WikiPage();
    $wiki_id = $_SESSION['wiki_id'];


    $query = "SELECT u.user_id, u.user_name, u.user_email, u.net_id
        FROM users u
        INNER JOIN wiki_users p
          ON p.user_id=u.user_id
		WHERE wiki_id='$wiki_id'
        GROUP BY u.user_id
        ORDER BY u.user_name; ";

    $query .= "SELECT page_id, heading_id, heading_name
    FROM headings
    WHERE wiki_id='$wiki_id'
    ORDER BY page_id, heading_id ASC;";

    $query .= "SELECT post_id, version, wc, creator_id, heading_id, page_id, edit_date,
    post_txt, prev, u.user_id, u.user_name, (SELECT COUNT(*) FROM likes l WHERE l.post_id=p.post_id) AS likes
    FROM posts p
    INNER JOIN users u
      ON u.user_id=p.creator_id
    WHERE wiki_id='$wiki_id'
    ORDER BY page_id, heading_id, prev, post_id, version ASC;";

    $query .= "SELECT post_id, comment_id, heading_id, page_id, c.user_id, wc, comment_date, comment_txt, u.user_name as commentor
    FROM comments c
    INNER JOIN users u
      ON u.user_id=c.user_id
    WHERE wiki_id='$wiki_id'
    ORDER BY post_id, comment_id ASC;";


    $mysqli->multi_query($query);

    $mysqli->next_result();
    $result = $mysqli->store_result();
    $json = array();
    while ($row = $result->fetch_assoc()) {
        $json[] = $row;
    }
    $wiki_page->users = $json;

    $mysqli->next_result();
    $result = $mysqli->store_result();
    $json = array();
    while ($row = $result->fetch_assoc()) {
        $json[] = $row;
    }
    $wiki_page->headings = $json;

    $mysqli->next_result();
    $result = $mysqli->store_result();
    $json = array();
    while ($row = $result->fetch_assoc()) {
        $json[] = $row;
    }
    $wiki_page->posts = $json;

    $mysqli->next_result();
    $result = $mysqli->store_result();
    $json = array();
    while ($row = $result->fetch_assoc()) {
        $json[] = $row;
    }
    $wiki_page->comments = $json;

    $result->close();
    $mysqli->close();
    echo json_encode($wiki_page);
}

?>