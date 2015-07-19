<?php
session_start();
$_POST = json_decode(file_get_contents("php://input"), true);
if (isset($_SESSION['wiki_id'])) {
    include("advanced_user_oo.php");
    require("PHPMailerAutoload.php");

    Define('DATABASE_SERVER', $hostname);
    Define('DATABASE_USERNAME', $username);
    Define('DATABASE_PASSWORD', $password);
    Define('DATABASE_NAME', 'wiki');

    $mysqli = new mysqli(DATABASE_SERVER, DATABASE_USERNAME, DATABASE_PASSWORD, DATABASE_NAME);

    $wiki_name = $_SESSION['wiki_name'];
    $subject = $wiki_name.' Post';
    $sender = $_SESSION['email'];
    $sender_name = $_SESSION['user_name'];
    if (isset($_POST['user_id'])) {
        $user_id = $_POST['user_id'];
    } else {
        $user_id = 0;
    }
    $wiki_id = $_SESSION['wiki_id'];
    $post_id = $_POST['post_id'];
    $post_txt = $_POST['post_txt'];
    $is_anon = $_POST['is_anon'];
    if (isset($_POST['canvas_course_id'])) {
        $canvas_course_id = $_POST['canvas_course_id'];
    } else {
        $canvas_course_id = 0;
    }


    $mail = new PHPMailer;
    $mail->isSMTP();
    $mail->Host       = "localhost";      // sets the SMTP server
    $mail->Port       = 25;               // set the SMTP port
    $mail->SMTPAuth   = false;            // disable SMTP authentication

    $mail->From = 'admin@your_server.com';
    $mail->FromName = $wiki_name;
    $mail->Subject    = $subject;
    $mail->WordWrap   = 60;

    $mail->isHTML(true);

    $mail->AltBody = "";

    $query = "SELECT user_email, user_name
        FROM users u
        LEFT JOIN wiki_users w
            ON w.user_id=u.user_id AND w.subscribed='1' AND w.wiki_id='$wiki_id' AND w.user_id!='$user_id'
        LEFT JOIN comments c
            ON c.post_id='$post_id' AND c.user_id=u.user_id AND c.user_id!='$user_id'
        LEFT JOIN posts p
            ON p.post_id='$post_id' AND p.creator_id=u.user_id AND p.creator_id!='$user_id'
        WHERE (c.comment_id IS NOT NULL OR p.creator_id IS NOT NULL OR w.user_id IS NOT NULL)
        GROUP BY user_email";
    $result = $mysqli->query($query);

    $body = '<h3>New '.$wiki_name.' Post</h3>';
    if (isset($_POST['heading_name'])) {
        $body .= '<h4>'.$_POST['heading_name'].'</h4>';
    }
    $body .= $post_txt;
    if ($is_anon != 1) {
        $body .= "<p>By ".$sender_name."</p>";
    }
    $body .= '<p><a href="https://your_canvas_url/courses/'.$canvas_course_id.'">'.$wiki_name.'</a></p>';

    $mail->Body = $body;

    $sent_mail = 0;
    while (list($user_email, $user_name) = $result->fetch_row()) {
        if ($sent_mail == 0) {
            $mail->addAddress($wiki_id.'wiki@your_server.com',$wiki_name);
        }
        $mail->addBCC($user_email,$user_name);
        $sent_mail = $sent_mail + 1;
    }
    if ($sent_mail != 0) {
        $mail->send();
        $mail->clearAddresses();
        $mail->clearBCCs();
    }

    $mysqli->close();
    echo json_encode($sent_mail);
}

?>