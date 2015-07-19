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
        var $posts = [];
        var $headings = [];
        var $micro_posts = [];
    }

    $mysqli = new mysqli(DATABASE_SERVER, DATABASE_USERNAME, DATABASE_PASSWORD, DATABASE_NAME);

    $wiki_page = new WikiPage();
    $page_id = $_POST['page_id'];
    $net_id = $_POST['net_id'];
    $last_login = $_POST['last_login'];
    $new_only = $_POST['new_only'];
    $show_micro_posts = $_POST['show_micro_posts'];
    $wiki_id = $_SESSION['wiki_id'];
    $priv_level = $_SESSION['priv_level'];

    $query = "INSERT INTO page_views
			(wiki_id, net_id, page_id, view_date) VALUES
			('$wiki_id', '$net_id', '$page_id', UTC_TIMESTAMP()); ";
    $result = $mysqli->query($query);

    if ($new_only == 1) {
        $query = "SELECT p.post_id, version, p.wc, creator_id, p.heading_id, creation_date, edit_date, post_txt, prev,
        IF((p.is_anon='1' AND '$priv_level'<3),'anonymous',IFNULL(u.user_name, 'Previous Student')) as user_name, p.is_anon, c.is_anon AS anon_comment,
        IF((c.is_anon='1' AND '$priv_level'<3),'anonymous',uc.user_name) as commentor, c.user_id AS commentor_id, comment_txt,
        comment_date, comment_id,
        (SELECT COUNT(*) FROM likes l WHERE l.post_id=p.post_id) AS likes, (p.edit_date>'$last_login') AS is_new, (c.comment_date>'$last_login') AS is_new_comment, (m.micro_date>'$last_login') AS is_new_micro
        FROM posts p
        LEFT JOIN users u
          ON u.user_id=p.creator_id
        LEFT JOIN comments c
            ON c.post_id=p.post_id
        LEFT JOIN micro_posts m
            ON m.post_id=p.post_id
        LEFT JOIN users uc
            ON uc.user_id=c.user_id
        WHERE p.page_id='$page_id' AND (p.edit_date>'$last_login' OR c.comment_date>'$last_login' OR m.micro_date>'$last_login')
        ORDER BY p.heading_id, prev, p.post_id, version ASC, comment_id ASC; ";

        $query .= "SELECT h.page_id, h.heading_id, h.creator_id, h.heading_name, h.prev
        FROM headings h
        LEFT JOIN posts p
            ON p.heading_id=h.heading_id AND p.edit_date>'$last_login'
        LEFT JOIN comments c
			ON c.heading_id=h.heading_id AND c.comment_date>'$last_login'
        WHERE h.wiki_id='$wiki_id' AND h.page_id='$page_id' AND (p.post_id IS NOT NULL OR c.comment_id IS NOT NULL)
        GROUP BY h.heading_id
        ORDER BY h.page_id, prev, h.heading_id; ";

        if ($show_micro_posts == 1) {
            $query .= "SELECT p.post_id, p.page_id, p.micro_id, p.wc, p.user_id, p.heading_id, micro_date, micro_txt,
                IF((p.is_anon='1' AND '$priv_level'<3),'anonymous',u.user_name) as user_name, p.is_anon,
                (p.micro_date>'$last_login') AS is_new_micro
                FROM micro_posts p
                INNER JOIN users u
                  ON u.user_id=p.user_id
                WHERE p.page_id='$page_id' AND p.micro_date>'$last_login'
                ORDER BY p.post_id, p.micro_id ASC, micro_date ASC; ";
        }

    } else {
        $query = "SELECT p.post_id, version, p.wc, creator_id, p.heading_id, creation_date, edit_date, post_txt, prev,
        IF((p.is_anon='1' AND '$priv_level'<3),'anonymous',IFNULL(u.user_name, 'Previous Student')) as user_name, p.is_anon, c.is_anon AS anon_comment,
        IF((c.is_anon='1' AND '$priv_level'<3),'anonymous',uc.user_name) as commentor, c.user_id AS commentor_id, comment_txt,
        comment_date, comment_id,
        (SELECT COUNT(*) FROM likes l WHERE l.post_id=p.post_id) AS likes, (p.edit_date>'$last_login') AS is_new, (c.comment_date>'$last_login') AS is_new_comment, (m.micro_date>'$last_login') AS is_new_micro
        FROM posts p
        LEFT JOIN users u
          ON u.user_id=p.creator_id
        LEFT JOIN comments c
            ON c.post_id=p.post_id
        LEFT JOIN micro_posts m
            ON m.post_id=p.post_id
        LEFT JOIN users uc
            ON uc.user_id=c.user_id
        WHERE p.page_id='$page_id'
        ORDER BY p.heading_id, prev, p.post_id, version ASC, comment_id ASC; ";

        $query .= "SELECT page_id, heading_id, creator_id, heading_name, prev
        FROM headings
        WHERE wiki_id='$wiki_id' AND page_id='$page_id'
        ORDER BY page_id, prev, heading_id; ";

        if ($show_micro_posts == 1) {
            $query .= "SELECT p.post_id, p.page_id, p.micro_id, p.wc, p.user_id, p.heading_id, micro_date, micro_txt,
                IF((p.is_anon='1' AND '$priv_level'<3),'anonymous',u.user_name) as user_name, p.is_anon,
                (p.micro_date>'$last_login') AS is_new_micro
                FROM micro_posts p
                INNER JOIN users u
                  ON u.user_id=p.user_id
                WHERE p.page_id='$page_id'
                ORDER BY p.post_id, p.micro_id ASC, micro_date ASC; ";
        }
    }

    $mysqli->multi_query($query);

    if ($mysqli->more_results()) {
        $mysqli->next_result();
        $result = $mysqli->store_result();
        $json = array();
        while ($row = $result->fetch_assoc()) {
            $json[] = $row;
        }
        $wiki_page->posts = $json;
    }

    if ($mysqli->more_results()) {
        $mysqli->next_result();
        $result = $mysqli->store_result();
        $json = array();
        while ($row = $result->fetch_assoc()) {
            $json[] = $row;
        }
        $wiki_page->headings = $json;
    }

    if ($mysqli->more_results()) {
        $mysqli->next_result();
        $result = $mysqli->store_result();
        $json = array();
        while ($row = $result->fetch_assoc()) {
            $json[] = $row;
        }
        $wiki_page->micro_posts = $json;
    }

    $result->close();
    $mysqli->close();
    echo json_encode($wiki_page);
}

?>