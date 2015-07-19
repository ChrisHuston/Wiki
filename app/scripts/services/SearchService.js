'use strict';

angular.module('wikiApp')
  .factory('SearchService', function SearchService($http, $location, UserService) {
        var searchInstance = {search:{}};

        searchInstance.search.res = [];

        searchInstance.searchWiki = function(term) {
            angular.forEach(UserService.videoPlayers, function(wikiPlayer) {
                if (wikiPlayer) {
                    wikiPlayer.dispose();
                }
            });
            var php_script = 'searchWiki.php';
            var uniqueSuffix = "?" + new Date().getTime();
            var params = {};
            params.term = term;
            $http({method: 'POST',
                url: UserService.appDir + 'php/' + php_script + uniqueSuffix,
                data: params,
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).
                success(function(data) {
                    var posts = [];
                    var currentPost = {post_id:0, version:0, versions:[]};
                    var last_version = {post_id:0, version:0};
                    var last_comment = {post_id:0, comment_id:0, commentor_id:0};
                    angular.forEach(data.res, function(post) {
                        post.edit_date = utcStrToLocalDate(post.edit_date);
                        post.label = post.user_name + ' v' + post.version;
                        post.version = parseInt(post.version);
                        if (currentPost.post_id !== post.post_id) {
                            if (currentPost.post_id !== 0) {
                                posts.push(angular.copy(currentPost));
                            }
                            currentPost = {post_id:post.post_id, page_id:post.page_id, page_name:post.page_name, heading_name:post.heading_name, likes:parseInt(post.likes), heading_id:post.heading_id, version:post.version, versions:[post], comments:[]};
                            last_version = {post_id:post.post_id, version:post.version};
                            last_comment = {post_id:post.post_id, comment_id:post.comment_id};
                            if (UserService.wiki.use_comments && post.comment_id) {
                                currentPost.comments.push(post);
                            }
                        } else {
                            if (last_version.post_id === post.post_id && last_version.version !== post.version) {
                                currentPost.version = post.version;
                                currentPost.versions.push(post);
                                last_version = {post_id:post.post_id, version:post.version};
                            }
                            if (UserService.wiki.use_comments && last_comment.comment_id && last_comment.comment_id !== post.comment_id) {
                                currentPost.comments.push(post);
                                last_comment.post_id = post.post_id;
                                last_comment.comment_id = post.comment_id;
                                last_comment.commentor_id = post.commentor_id;
                            }

                        }
                    });
                    if (currentPost.post_id !== 0) {
                        posts.push(currentPost);
                    }
                    searchInstance.search.res = posts;

                    $location.path('/search');
                    UserService.initVideos();
                }).
                error(function(data, status) {
                    alert("Error: " + status + " Search failed. Check your internet connection");
                });
        };

        return searchInstance;
  });

angular.module('wikiApp').directive('onEnter', function () {
    return function(scope, element, attrs) {
        element.bind("keydown keypress", function(event) {
            if(event.which === 13) {
                scope.$apply(function(){
                    scope.$eval(attrs.onEnter);
                });
                event.preventDefault();
            }
        });
    };
});
