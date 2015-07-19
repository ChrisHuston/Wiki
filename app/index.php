<?php
session_start();
// Load up the Basic LTI Support code
require_once 'ims-blti/blti.php';
// Initialize, all secrets are 'secret', do not set session, and do not redirect
$context = new BLTI("YourSecret", false, false);

if ( $context->valid && isset($_POST['custom_canvas_course_id'])) {
    $wiki_name = $_POST['resource_link_title'];
    $canvas_course_id = $_POST['custom_canvas_course_id'];
    if (isset($_GET['id'])) {
        $canvas_course_id = $_GET['id'];
    }
    if (isset($_POST['custom_wiki_id']) && $_POST['custom_wiki_id'] != 0) {
        $canvas_course_id = $_POST['custom_wiki_id'];
    }
    $_SESSION['canvas_course_id'] = $canvas_course_id;
    $_SESSION['net_id'] = strtoupper($_POST['custom_canvas_user_login_id']);
    $_SESSION['email'] = strtolower($_POST['lis_person_contact_email_primary']);
    $_SESSION['family_name'] = $_POST['lis_person_name_family'];
    $_SESSION['given_name'] = $_POST['lis_person_name_given'];
    $_SESSION['user_name'] = $_POST['lis_person_name_full'];
    $_SESSION['canvas_user_id'] = $_POST['custom_canvas_user_id'];
    $roles = $_POST['roles'];
    if (strpos($roles, 'Administrator') !== false || strpos($roles, 'Instructor') !== false || strpos($roles, 'Designer' || strpos($roles, 'ContentDeveloper') !== false) !== false) {
        $_SESSION['priv_level'] = 3;
    } else if (strpos($roles, 'TeachingAssistant') !== false) {
        $_SESSION['priv_level'] = 2;
    } else {
        $_SESSION['priv_level'] = 1;
    }

    include("advanced_user_oo.php");
    Define('DATABASE_SERVER', $hostname);
    Define('DATABASE_USERNAME', $username);
    Define('DATABASE_PASSWORD', $password);
    Define('DATABASE_NAME', 'wiki');
    $mysqli = new mysqli(DATABASE_SERVER, DATABASE_USERNAME, DATABASE_PASSWORD, DATABASE_NAME);
    $query = "SELECT wiki_id FROM wikis WHERE canvas_course_id='$canvas_course_id' AND wiki_name='$wiki_name'";
    $result = $mysqli->query($query);
    list($wiki_id) = $result->fetch_row();
    if ($wiki_id == ""|| is_null($wiki_id) || $wiki_id == "0") {
        $description = "<p>".$wiki_name." wiki</p>";
        $query = "INSERT INTO wikis
				(wiki_name, canvas_course_id, description, creation_date) VALUES
				('$wiki_name', '$canvas_course_id', '$description', UTC_TIMESTAMP())";
        $res = $mysqli->query($query);
        $wiki_id = $mysqli->insert_id;
    }
    $mysqli->close();
    $_SESSION['wiki_id'] = $wiki_id;
    $_SESSION['wiki_name'] = $wiki_name;
}
?>

<!doctype html>
  <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>Wiki</title>
    <meta name="description" content="">
    <meta name="viewport" content="width=device-width">
    <link href="//vjs.zencdn.net/4.12/video-js.css" rel="stylesheet">
    <script src="//vjs.zencdn.net/4.12/video.js"></script>
    <!-- Place favicon.ico and apple-touch-icon.png in the root directory -->
    <link rel="stylesheet" href="../bower_components/jquery-ui/themes/ui-lightness/jquery-ui.min.css" />
    <link rel="styleSheet" href="../bower_components/angular-ui-grid/ui-grid.min.css"/>
    <link rel="stylesheet" href="../bower_components/bootstrap/dist/css/bootstrap.min.css">
    <link rel="stylesheet" href="../bower_components/font-awesome/css/font-awesome.min.css">
        <!-- build:css({.tmp,app}) styles/main.css -->
        <link rel="stylesheet" href="styles/main.css">
        <!-- endbuild -->
</head>
  <body ng-app="wikiApp">

  <div ng-controller="MenuCtrl">
      <nav class="navbar navbar-default navbar-fixed-top" role="navigation">
          <!-- Brand and toggle get grouped for better mobile display -->
          <div class="navbar-header">
              <button type="button" class="navbar-toggle" data-toggle="collapse" data-target="#wiki-navbar-collapse">
                  <span class="sr-only">Toggle navigation</span>
                  <span class="icon-bar"></span>
                  <span class="icon-bar"></span>
                  <span class="icon-bar"></span>
              </button>
          </div>

          <!-- Collect the nav links, forms, and other content for toggling -->
          <div class="collapse navbar-collapse" id="wiki-navbar-collapse">
              <ul class="nav navbar-nav">
                  <li ng-class="{active:is_wiki}"><a href="" ng-click="setActive('/')">{{wiki.wiki_name}}</a></li>
                  <li ng-show="user.priv_level>1" ng-class="{active:is_stats}"><a href="" ng-click="setActive('/stats')">Stats</a></li>
                  <li ng-show="user.priv_level>1" ng-class="{active:is_admin}"><a href="" ng-click="setActive('/admin')">Admin</a></li>
                  <li ng-show="user.priv_level>1" ng-class="{active:is_views}"><a href="" ng-click="setActive('/pageviews')">Page Views</a></li>
              </ul>
              <button class="btn btn-link menu-btn hide-phone pull-left" ng-click="getFullWiki($event)">Make PDF</button>

              <form class="pull-left" ng-show="pdf_ready" action="https://www.your_server.com/app/tcpdf/wiki.php" method="post" target="_blank" style="display: inline-block">
                  <input type="hidden" name="wiki" ng-value="full_wiki" />
                  <input type="hidden" name="name" ng-value="wiki.wiki_name" />
                  <button type="submit" class="btn btn-default menu-btn" ng-click="pdf_ready = false">
                      <i class="fa fa-download"></i> <span class="hide-phone">Get PDF</span>
                  </button>
              </form>
              <button class="btn btn-link menu-btn pull-left" ng-click="fullscreen()" tooltip-placement="bottom" tooltip="Open in new tab" tooltip-placement="left"><i class="fa fa-external-link"></i></button>

              <button ng-show="user.is_admin" tooltip-placement="bottom" tooltip="Toggle Admin and Student views" class="btn btn-link menu-btn pull-right" ng-class="{'toggle-view':user.priv_level<2}" ng-click="toggleView()"><i class="fa fa-eye"></i></button>
              <form class="navbar-form navbar-right" style="width:320px; margin-right: 10px; padding: 0;">
                  <div class="btn-group" dropdown is-open="status.isopen" ng-show="wiki.headings.length>1">
                      <button type="button" class="btn btn-default dropdown-toggle">
                          Sections <span class="caret"></span>
                      </button>
                      <ul class="dropdown-menu" role="menu">
                          <li ng-repeat="h in wiki.headings" ng-click="jumpToHeading(h)"><a href>{{h.heading_name}}</a></li>
                      </ul>
                  </div>
                  <div class="input-group pull-right" style="width: 220px;">
                  <input type="text" class="form-control" placeholder="Search" ng-model="searchTerm" on-enter="searchWiki()">
                        <span class="input-group-btn">
                            <button class="btn btn-default" ng-click="searchWiki()"><i class="fa fa-search"></i></button>
                        </span>
                  </div>
              </form>
          </div><!-- /.navbar-collapse -->
      </nav>
  </div>

    <!-- Add your site or application content here -->
    <div class="container-fluid" ng-view=""></div>

        <script src="../bower_components/jquery/dist/jquery.min.js"></script>
        <script src="../bower_components/jquery-ui/jquery-ui.min.js"></script>
        <script src="../bower_components/angular/angular.min.js"></script>
        <script src="../bower_components/angular-sanitize/angular-sanitize.min.js"></script>
        <script src="../bower_components/angular-route/angular-route.min.js"></script>

        <script src="scripts/app.js"></script>
        <script src="scripts/controllers/main.js"></script>
        <script src="scripts/controllers/stats.js"></script>
        <script src="scripts/controllers/settings.js"></script>
        <script src="scripts/controllers/admin.js?v=2"></script>
        <script src="scripts/controllers/menuController.js"></script>
        <script src="scripts/services/userService.js?v=1"></script>
        <script src="scripts/directives/userUpload.js"></script>
        <script src="scripts/controllers/pageViews.js"></script>
        <script src="scripts/controllers/search.js"></script>
        <script src="scripts/services/SearchService.js"></script>

    <script src="//tinymce.cachefly.net/4.2/tinymce.min.js"></script>
    <script src="../bower_components/angular-bootstrap/ui-bootstrap-tpls.min.js"></script>
    <script src="../bower_components/momentjs/min/moment.min.js"></script>
    <script src="../bower_components/lodash/dist/lodash.min.js"></script>
    <script src="../bower_components/bootstrap/dist/js/bootstrap.min.js"></script>
  <script src="../bower_components/ng-flow/dist/ng-flow-standalone.min.js"></script>
  <script src="../bower_components/angular-ui-grid/csv.js"></script>
  <script src="../bower_components/angular-ui-grid/ui-grid.min.js"></script>
</body>
</html>
