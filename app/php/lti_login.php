<?php
session_start();
class UserInfo {
    var $user_name = "";
    var $user_id;
    var $user_email = "";
    var $net_id = "";
    var $priv_level;
    var $login_error = "NONE";
    var $wiki_id = 0;
    var $wiki_name = "";
    var $description = "";
    var $root_folder = "";
    var $app_folder = "";
    var $use_versions = 1;
    var $use_comments = 0;
    var $use_anon = 0;
    var $use_likes = 0;
    var $add_pages = 0;
    var $add_sections = 0;
    var $max_posts = 0;
    var $logo_link = "";
    var $last_login = "";
    var $pages = [];
    var $page_id;
    var $section_id;
    var $subscribed = 0;
    var $canvas_course_id = 0;
    var $word_count = 0;
}

$login_result = new UserInfo();

$_POST = json_decode(file_get_contents("php://input"), true);
if (isset($_SESSION['wiki_id'])) {
    include("advanced_user_oo.php");
    Define('DATABASE_SERVER', $hostname);
    Define('DATABASE_USERNAME', $username);
    Define('DATABASE_PASSWORD', $password);
    Define('DATABASE_NAME', 'wiki');
    $mysqli = new mysqli(DATABASE_SERVER, DATABASE_USERNAME, DATABASE_PASSWORD, DATABASE_NAME);

    $user_email = strtolower($_SESSION['email']);

    $canvas_priv_level = $_SESSION['priv_level'];

    $saml_user_name = $_SESSION['user_name'];
    $net_id = strtolower($_SESSION['net_id']);

    $wiki_id = $_SESSION['wiki_id'];
    $os = $_POST['os'];
    $version = $_POST['version'];

    $query = "SELECT wiki_name, description, root_folder, app_folder, logo_link,
                use_versions, use_comments, use_anon, use_likes, add_pages, add_sections, max_posts,
                u.user_id, u.user_name, wu.priv_level, max(login_date) as last_login, wu.subscribed,
                IFNULL((SELECT SUM(wc) FROM comments c where wiki_id='$wiki_id' AND c.user_id=u.user_id),0) AS comment_words,
                IFNULL((SELECT SUM(wc) FROM posts p where wiki_id='$wiki_id' AND p.creator_id=u.user_id),0) AS post_words,
                IFNULL((SELECT SUM(wc) FROM micro_posts m where wiki_id='$wiki_id' AND m.user_id=u.user_id),0) AS micro_words
			FROM wikis w
        	LEFT JOIN users u
              ON u.net_id='$net_id'
            LEFT JOIN logins l
              ON l.user_id=u.user_id AND l.wiki_id='$wiki_id'
            LEFT JOIN wiki_users wu
              ON wu.user_id=u.user_id AND wu.wiki_id='$wiki_id'
            WHERE w.wiki_id='$wiki_id'";
    $result = $mysqli->query($query);
    list($wiki_name, $description, $root_folder, $app_folder, $logo_link, $use_versions, $use_comments, $use_anon, $use_likes, $add_pages, $add_sections, $max_posts, $user_id, $user_name, $priv_level, $last_login, $subscribed, $comment_words, $post_words, $micro_words) = $result->fetch_row();

    $login_result->word_count = $comment_words + $post_words + $micro_words;
    if ($wiki_name == "") {
        $login_result->login_error = "Wiki no longer exists.";
        echo json_encode($login_result);
        return;
    } else if ($user_id == "" || is_null($user_id)) {
        $query = "INSERT INTO users
				(net_id, user_name, user_email, join_date, priv_level) VALUES
				('$net_id', '$saml_user_name', '$user_email', UTC_TIMESTAMP(), '1')";
        $mysqli->query($query);
        $user_id = $mysqli->insert_id;
    }
    if (is_null($priv_level) || $priv_level==0 || $priv_level=="") {
        $priv_level = $canvas_priv_level;
        $query = "INSERT INTO wiki_users
				(user_id, wiki_id, priv_level) VALUES
				('$user_id', '$wiki_id', '$priv_level')";
        $mysqli->query($query);
    }

    $_SESSION['priv_level'] = $priv_level;

    if (isset($_SESSION['page_id'])) {
        $login_result->page_id = $_SESSION['page_id'];
        unset($_SESSION['page_id']);
    }

    if (isset($_SESSION['section_id'])) {
        $login_result->section_id = $_SESSION['section_id'];
        unset($_SESSION['section_id']);
    }

    if ($last_login == "" || is_null($last_login)) {
        $last_login = date("Y-m-d H:i:s", time());
    }

    $query = "INSERT INTO logins
				(user_id, os, wiki_id, login_date) VALUES
				('$user_id', '$os', '$wiki_id', UTC_TIMESTAMP()); ";

    $query .= "SELECT p.page_id, p.page_name, p.creator_id, p.wiki_id, p.prev, COUNT(c.post_id) AS new_posts,
(SELECT COUNT(comment_id) FROM comments WHERE comment_date>'$last_login' AND user_id!='$user_id' AND wiki_id='$wiki_id' AND page_id=p.page_id) AS new_comments
        FROM wiki.pages p
        LEFT JOIN posts c
          ON c.page_id=p.page_id AND c.edit_date>'$last_login' AND c.creator_id != '$user_id'
        WHERE p.wiki_id='$wiki_id'
        GROUP BY p.page_id
        ORDER BY prev, page_name;";

    $query .= "SELECT p.page_id, p.page_name, p.creator_id, p.wiki_id, p.prev, COUNT(c.post_id) AS new_posts,
(SELECT COUNT(comment_id) FROM comments WHERE comment_date>'$last_login' AND user_id!='$user_id' AND wiki_id='$wiki_id' AND page_id=p.page_id) AS new_comments,
(SELECT COUNT(micro_id) FROM micro_posts WHERE micro_date>'$last_login' AND user_id!='$user_id' AND wiki_id='$wiki_id' AND page_id=p.page_id) AS new_micros
        FROM wiki.pages p
        LEFT JOIN posts c
          ON c.page_id=p.page_id AND c.edit_date>'$last_login' AND c.creator_id != '$user_id'
        WHERE p.wiki_id='$wiki_id'
        GROUP BY p.page_id
        ORDER BY prev, page_name;";


    $mysqli->multi_query($query);

    if ($mysqli->more_results()) {
        $mysqli->next_result();
        $result = $mysqli->store_result();
        $json = array();
        while ($row = $result->fetch_assoc()) {
            $json[] = $row;
        }
        $login_result->pages = $json;
    }



    $login_result->wiki_id = $wiki_id;
    $login_result->wiki_name = $wiki_name;
    $login_result->description = $description;
    $login_result->root_folder = $root_folder;
    $login_result->app_folder = $app_folder;
    $login_result->logo_link = $logo_link;
    $login_result->use_versions = $use_versions;
    $login_result->use_comments = $use_comments;
    $login_result->use_anon = $use_anon;
    $login_result->use_likes = $use_likes;
    $login_result->add_pages = $add_pages;
    $login_result->add_sections = $add_sections;
    $login_result->max_posts = $max_posts;
    $login_result->subscribed = $subscribed;
    $login_result->last_login = $last_login;
    $login_result->user_name = $user_name;
    $login_result->user_email = $user_email;
    $login_result->priv_level = $priv_level;
    $login_result->user_id = $user_id;
    $login_result->net_id = $net_id;
    $login_result->canvas_course_id = $_SESSION['canvas_course_id'];

    $mysqli->close();
    echo json_encode($login_result);

} else {
    $login_result->login_error = "Cookies disabled.";
    echo json_encode($login_result);
}

?>