<?php
session_start();
$_POST = json_decode(file_get_contents("php://input"), true);
if (isset($_SESSION['wiki_id']) AND isset($_SESSION['priv_level']) AND $_SESSION['priv_level']>1) {
    include("advanced_user_oo.php");
    Define('DATABASE_SERVER', $hostname);
    Define('DATABASE_USERNAME', $username);
    Define('DATABASE_PASSWORD', $password);
    Define('DATABASE_NAME', 'wiki');

    class WikiData {
        var $page_views = [];
    }

    $mysqli = new mysqli(DATABASE_SERVER, DATABASE_USERNAME, DATABASE_PASSWORD, DATABASE_NAME);

    $wiki_data = new WikiData();
    $wiki_id = $_SESSION['wiki_id'];

    $query = "SELECT v.net_id, u.user_name, v.page_id, p.page_name, COUNT(*) AS view_count
FROM wiki.page_views v
INNER JOIN pages p
	ON p.page_id=v.page_id
INNER JOIN users u
	ON u.net_id=v.net_id
WHERE v.wiki_id='$wiki_id'
group by v.net_id, v.page_id order by u.user_name, p.page_name";
    $result = $mysqli->query($query);
    $json = array();
    while ($row = $result->fetch_assoc()) {
        $json[] = $row;
    }
    $wiki_data->page_views = $json;

    $result->close();
    $mysqli->close();
    echo json_encode($wiki_data);
}

?>