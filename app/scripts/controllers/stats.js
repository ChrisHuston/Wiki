'use strict';

angular.module('wikiApp')
  .controller('StatsCtrl', function ($scope, $http, UserService, $filter, $location, uiGridConstants) {
        if (UserService.wiki.wiki_id === 0) {
            $location.path('/');
            return;
        }
        $scope.wiki = UserService.wiki;

        $scope.setBadgeColor = function(post) {
            if (post.likes < 1) {
                return "";
            } else if (post.likes < 3) {
                return "likes-low";
            } else if (post.likes < 6) {
                return "likes-mid";
            } else {
                return "likes-high";
            }
        };

        /*
        var countWords = function(html) {
            var div = document.createElement("div");
            div.innerHTML = html;
            var str = div.textContent || div.innerText || "";
            str = str.trim();
            return str.split(/\s+\b/).length;
        };
        */

        /*
        var getTotalWords = function(userPosts) {
            var totalWords = 0;
            angular.forEach(userPosts, function(post) {
                totalWords += countWords(post.post_txt);
            });
            return totalWords;
        };
        */

        //$scope.users = [];
        $scope.showGrid = false;

        $scope.getAllStats = function() {
            var uniqueSuffix = "?" + new Date().getTime();
            var params = {};
            params.wiki_id = UserService.wiki.wiki_id;
            $http({method: 'POST',
                url: UserService.appDir + 'php/getAllStats.php' + uniqueSuffix,
                data: params,
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).
                success(function(data) {
                    $scope.wiki.headings = data.headings;
                    angular.forEach(data.users, function(user) {
                        var userPosts = $filter('filter')(data.posts, function(p) {return p.creator_id===user.user_id});
                        var userComments = $filter('filter')(data.comments, function(c) {return c.user_id===user.user_id});
                        user.total_posts = 0;
                        user.total_edits = 0;
                        user.total_comments = 0;
                        user.post_words = 0;
                        user.comment_words = 0;
                        angular.forEach(userPosts, function(p) {
                            user.post_words += parseInt(p.wc);
                            if (p.version === '1') {
                                user.total_posts += 1;
                            } else {
                                user.total_edits += 1;
                            }
                        });
                        angular.forEach(userComments, function(c) {
                            var comment_words = parseInt(c.wc);
                            user.comment_words += comment_words;
                            c.comment_date = utcStrToLocalDate(c.comment_date);
                            user.total_comments += 1;
                        });
                    });
                    $scope.users = data.users;

                    var posts = [];
                    var currentPost = {post_id:0, version:0, versions:[]};
                    angular.forEach(data.posts, function(post) {
                        post.edit_date = utcStrToLocalDate(post.edit_date);
                        post.label = post.user_name + ' v' + post.version;
                        post.version = parseInt(post.version);
                        post.wc = parseInt(post.wc);
                        if (currentPost.post_id !== post.post_id) {
                            if (currentPost.post_id !== 0) {
                                posts.push(angular.copy(currentPost));
                            }
                            var postComments = $filter('filter')(data.comments, function(c) {return c.post_id===post.post_id});
                            currentPost = {post_id:post.post_id, user_id:post.user_id, creator_id:post.creator_id, page_id:post.page_id, heading_id:post.heading_id, version:post.version, versions:[post], comments:postComments, likes:post.likes};
                        } else {
                            currentPost.version = post.version;
                            currentPost.versions.push(post);
                        }
                    });
                    if (currentPost.post_id !== 0) {
                        posts.push(currentPost);
                    }

                    $scope.wiki.posts = posts;
                    $scope.wiki.comments = data.comments;
                    $scope.showGrid = true;
                    $scope.statsGridOptions.data = data.users;
                }).
                error(function(data, status) {
                    alert("Error: " + status + " Get stats failed. Check your internet connection");
                });

        };

        $scope.getAllStats();

        var initUserPosts = function() {
            angular.forEach($scope.wiki.headings, function(h) {
                h.has_user_post = false;
                outer_loop:
                for (var i = 0; i < $scope.wiki.posts.length; i++) {
                    for (var v = 0; v < $scope.wiki.posts[i].versions.length; v++) {
                        if (h.heading_id===$scope.wiki.posts[i].versions[v].heading_id && $scope.wiki.posts[i].versions[v].user_id === $scope.selectedUserId) {
                            h.has_user_post = true;
                            break outer_loop;
                        }
                    }
                }
                if (!h.has_user_post) {
                    for (var c = 0; c < $scope.wiki.comments.length; c++) {
                        if (h.heading_id === $scope.wiki.comments[c].heading_id && $scope.wiki.comments[c].user_id === $scope.selectedUserId) {
                            h.has_user_post = true;
                            break;
                        }
                    }
                }
            });
        };

        $scope.selectedUserId = null;


        $scope.statsGridOptions = {
            showGridFooter: true,
            showColumnFooter: true,
            enableFiltering: true,
            enableSorting: true,
            enableRowSelection: true,
            multiSelect: false,
            modifierKeysToMultiSelect: false,
            enableRowHeaderSelection: false,
            noUnselect: true,
            enableGridMenu: true,
            enableCellEditOnFocus: false,
            columnDefs: [{field:'user_name', displayName:'Name', type:'string', aggregationType: uiGridConstants.aggregationTypes.count},
                {field:'net_id', displayName:'net ID', visible:false, type:'string'},
                {field:'total_posts', displayName:'Posts', width:'120',cellClass:'numericCol',filters: [
                    {
                        condition: uiGridConstants.filter.GREATER_THAN,
                        placeholder: 'greater than'
                    },
                    {
                        condition: uiGridConstants.filter.LESS_THAN,
                        placeholder: 'less than'
                    }
                ], headerClass:'c-header', type:'number', aggregationType: uiGridConstants.aggregationTypes.sum},
                {field:'total_edits', visible:$scope.wiki.use_versions, displayName:'Edits', width:'90',cellClass:'numericCol',filters: [
                    {
                        condition: uiGridConstants.filter.GREATER_THAN,
                        placeholder: 'greater than'
                    },
                    {
                        condition: uiGridConstants.filter.LESS_THAN,
                        placeholder: 'less than'
                    }
                ], headerClass:'c-header', type:'number', aggregationType: uiGridConstants.aggregationTypes.sum},
                {field:'total_comments', visible:$scope.wiki.use_comments, displayName:'Comments', width:'120',cellClass:'numericCol',filters: [
                    {
                        condition: uiGridConstants.filter.GREATER_THAN,
                        placeholder: 'greater than'
                    },
                    {
                        condition: uiGridConstants.filter.LESS_THAN,
                        placeholder: 'less than'
                    }
                ], headerClass:'c-header', type:'number', aggregationType: uiGridConstants.aggregationTypes.sum},
                {field:'post_words', displayName:'Post Words', width:'140',cellClass:'numericCol', headerClass:'c-header', type:'number',filters: [
                    {
                        condition: uiGridConstants.filter.GREATER_THAN,
                        placeholder: 'greater than'
                    },
                    {
                        condition: uiGridConstants.filter.LESS_THAN,
                        placeholder: 'less than'
                    }
                ], aggregationType: uiGridConstants.aggregationTypes.sum},
                {field:'comment_words', visible:$scope.wiki.use_comments, displayName:'Comment Words', width:'170',cellClass:'numericCol',filters: [
                    {
                        condition: uiGridConstants.filter.GREATER_THAN,
                        placeholder: 'greater than'
                    },
                    {
                        condition: uiGridConstants.filter.LESS_THAN,
                        placeholder: 'less than'
                    }
                ], headerClass:'c-header', type:'number', aggregationType: uiGridConstants.aggregationTypes.sum}
            ]
        };


        $scope.statsGridOptions.onRegisterApi = function(gridApi){
            gridApi.selection.on.rowSelectionChanged($scope,function(row){
                if (row.isSelected) {
                    $scope.selectedUserId = row.entity.user_id;
                    initUserPosts();
                } else {
                    $scope.selectedUserId = null;
                }

            });
        };


        $scope.filterPages = function(page) {
            if (!$scope.selectedUserId) {
                return true
            } else {
                for (var i = 0; i < $scope.wiki.posts.length; i++) {
                    var versions = $scope.wiki.posts[i].versions;
                    var comments = $scope.wiki.posts[i].comments;
                    for (var j=versions.length-1; j>=0; j--) {
                        if (versions[j].page_id === page.page_id && versions[j].creator_id===$scope.selectedUserId) {
                            //$scope.wiki.posts[i].version = versions[j].version;
                            return true;
                        }
                    }
                    for (var j=comments.length-1; j>=0; j--) {
                        if ($scope.wiki.posts[i].page_id === page.page_id && comments[j].user_id===$scope.selectedUserId) {
                            //$scope.wiki.posts[i].version = versions[j].version;
                            return true;
                        }
                    }
                }
            }
            return false;
        };

        $scope.filterPosts = function(heading) {
            if (!$scope.selectedUserId) {
                return function(item) {
                    return (item.heading_id===heading.heading_id);
                };
            } else {
                return function(item) {
                    if (item.heading_id===heading.heading_id) {
                        if (item.hasOwnProperty('comments')) {
                            for (var j=item.comments.length-1; j >=0; j--) {
                                if (item.comments[j].user_id === $scope.selectedUserId) {
                                    return true;
                                }
                            }
                        }
                        if (item.hasOwnProperty('versions')) {
                            var has_version = false;
                            for (var i=item.versions.length-1; i >=0; i--) {
                                if (item.versions[i].creator_id === $scope.selectedUserId) {
                                    has_version = true;
                                }
                            }
                            return has_version;
                        }
                        return false;
                    } else {
                        return false;
                    }
                };
            }
        };

        $scope.filterComments = function(c) {
            if (!$scope.selectedUserId) {
                return true
            } else {
                return c.user_id===$scope.selectedUserId
            }
        };
  });
