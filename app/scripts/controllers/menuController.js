'use strict';

angular.module('wikiApp')
  .controller('MenuCtrl', function ($scope, UserService, $http, $filter, $location, $window, $anchorScroll, SearchService) {

        $scope.user = UserService.user;
        UserService.login();
        $scope.wiki = UserService.wiki;
        $scope.is_wiki = true;

        $scope.setActive = function(loc) {
            $scope.is_wiki = false;
            $scope.is_stats = false;
            $scope.is_admin = false;
            $scope.is_views = false;
            $('#wiki-navbar-collapse').collapse('hide');
            $location.path(loc);
            if (loc === "/") {
                $scope.is_wiki = true;
                UserService.current.views = 0;
                UserService.current.currentPage = {page_id:0, page_name:""};
                UserService.current.posts = [];
            } else if (loc === "/stats") {
                $scope.is_stats = true;
            } else if (loc === '/admin') {
                $scope.is_admin = true;
            } else if (loc === '/pageviews') {
                $scope.is_views = true;
            }
        };

        $scope.status = {isopen: false};

        $scope.toggleDropdown = function($event) {
            $event.preventDefault();
            $event.stopPropagation();
            $scope.status.isopen = !$scope.status.isopen;
        };

        $scope.jumpToHeading = function(h) {
            var anchor_id = "sect_" + h.page_id + "_" + h.heading_id;
            var old_hash = $location.hash();
            $location.hash(anchor_id);
            $anchorScroll();
            $location.hash(old_hash);
            $scope.status.isopen = false;
            $window.scrollBy(0, -60);
        };

        $scope.searchTerm = '';
        $scope.searchWiki = function() {
            if ($scope.searchTerm) {
                SearchService.searchWiki($scope.searchTerm);
            }
        };

        $scope.toggleView = function() {
            var prev_priv = $scope.user.priv_level;
            $scope.user.priv_level = $scope.user.toggle_level;
            $scope.user.toggle_level = prev_priv;
        };

        $scope.getFullWiki = function(evt) {
            var uniqueSuffix = "?" + new Date().getTime();
            var params = {};
            params.admin_only = evt.shiftKey?1:0;
            params.wiki_id = UserService.wiki.wiki_id;
            $http({method: 'POST',
                url: UserService.appDir+ 'php/getAllPosts.php' + uniqueSuffix,
                data: params,
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).
                success(function(data) {
                    var wiki_pdf = "<h2>" + UserService.wiki.wiki_name + "</h2>";
                    wiki_pdf += UserService.wiki.description;
                    angular.forEach(UserService.wiki.pages, function(p) {
                        wiki_pdf += "<h3>" + p.page_name + "</h3>";
                        var pageHeadings = _.filter(data.headings, function(page) {
                            return page.page_id === p.page_id;
                        });
                        angular.forEach(pageHeadings, function(h) {
                            wiki_pdf += "<h4>" + h.heading_name + "</h4>";
                            var headingPosts = _.filter(data.posts, function(heading) {
                                return heading.heading_id === h.heading_id;
                            });
                            angular.forEach(headingPosts, function(post) {
                                post.display_date = $filter('date')(utcStrToLocalDate(post.edit_date), "MMM dd, yyyy HH:mm");
                                var regex = /#\/page\//g;
                                post.post_txt = post.post_txt.replace(regex, UserService.wiki.app_folder + "#/page/");
                                wiki_pdf += post.post_txt;
                                wiki_pdf += "<p>" + post.user_name + ", " + post.display_date + "</p>";
                            });
                        });
                    });
                    $scope.full_wiki = wiki_pdf;
                    $scope.pdf_ready = true;
                }).
                error(function(data, status) {
                    alert("Error: " + status + " Get wiki pdf failed. Check your internet connection");
                });
        };

        $scope.fullscreen = function() {
            $window.open("https://www.kblocks.com/app/wiki/index.php");
        };

  });
