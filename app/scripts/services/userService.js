'use strict';

function get_ua() {
    var ua = navigator.userAgent;
    var loc = ua.search('Mozilla/5.0 ');
    if (loc !== -1) {
        ua = ua.replace('Mozilla/5.0 ', '');
    }
    loc = ua.search('AppleWebKit/');
    if (loc !== -1) {
        ua = ua.replace('AppleWebKit/','');
    }
    loc = ua.search(/\(KHTML, like Gecko\) /);
    if (loc !== -1) {
        ua = ua.replace('(KHTML, like Gecko) ','');
    }
    loc = ua.search(/\(/);
    if (loc !== -1) {
        ua = ua.replace('(','');
    }
    return ua;
}

function utcStrToLocalDate(dtstr) {
    var utcDate;
    if (angular.isDate(dtstr)) {
        utcDate  = dtstr;
    } else {
        var year = dtstr.substr(0,4);
        var month = (dtstr.substr(5,2)-1);
        var day = dtstr.substr(8,2);
        utcDate = new Date(year, month, day, dtstr.substr(11,2), dtstr.substr(14,2), dtstr.substr(17,2)).getTime();
    }
    var offset = new Date().getTimezoneOffset() * 60 * 1000;
    return new Date(utcDate - offset);
}

wikiApp.factory('UserService', ['$http', '$location', '$window', '$sce', '$timeout', function($http, $location, $window, $sce, $timeout) {
    var userInstance = {};
    userInstance.appDir = "/app/wiki/";

    userInstance.initApp = function() {
        userInstance.user = {user_id:0, priv_level:0, user_name:"", loginError:null, canvas_course_id:0};
        userInstance.wiki = {wiki_id:0, subscribed:'0', new_only:0, use_versions:true, use_comments:false,
            wiki_name:"", description:"", page_views:[], users:[],
            pages:[], headings:[], posts:[], micro_posts:[],
            root_folder:"", app_folder:""};
        userInstance.ua = get_ua();
        userInstance.version = "1.0.0";
    };

    userInstance.current = {};
    userInstance.current.views = 0;
    userInstance.current.currentPage = {page_id:0, page_name:""};
    userInstance.current.posts = [];

    userInstance.initApp();
    userInstance.videoPlayers = [];
    var playStartTime = 0;

    var logPlayStart = function(evt) {
        var videoFilePieces = evt.srcElement.currentSrc.split("/");
        var videoFile = videoFilePieces[videoFilePieces.length-1].split("?")[0];
        var uniqueSuffix = "?" + new Date().getTime();
        playStartTime = new Date().getTime();
        var params = {};
        params.videoFile = videoFile;
        params.user_id = userInstance.user.user_id;
        params.page_id = userInstance.current.currentPage.page_id;
        $http({method: 'POST',
            url: userInstance.appDir + 'php/logPlayStart.php' + uniqueSuffix,
            data: params,
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        }).
            success(function() {
            }).
            error(function(data, status) {
                alert("Error: " + status + " Video start failed. Check your internet connection");
            });

    };

    var logStop = function(evt) {
        var videoFilePieces = evt.srcElement.currentSrc.split("/");
        var videoFile = videoFilePieces[videoFilePieces.length-1].split("?")[0];
        var uniqueSuffix = "?" + new Date().getTime();
        var params = {};
        params.videoFile = videoFile;
        params.user_id = userInstance.user.user_id;
        params.page_id = userInstance.current.currentPage.page_id;
        params.duration = (new Date().getTime() - playStartTime)/1000;
        $http({method: 'POST',
            url: userInstance.appDir + 'php/logStop.php' + uniqueSuffix,
            data: params,
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        }).
            success(function() {
            }).
            error(function(data, status) {
                alert("Error: " + status + " Video end failed. Check your internet connection");
            });

    };

    var loadedVideos = [];

    userInstance.initVideos = function() {
        userInstance.videoPlayers = [];
        $timeout(function() {
            var videos = document.getElementsByClassName('t-wiki-video');
            var uniqueVideo = new Date().getTime();
            var counter = 1;

            angular.forEach(videos, function(v) {
                v.id = "v_" + counter;
                if (v.src) {
                    var videoFilePieces = v.src.split("/");
                    var videoFile = videoFilePieces[videoFilePieces.length-1].split("?")[0];
                    if (loadedVideos.lastIndexOf(videoFile) !== -1) {
                        v.src = v.src + '?' + uniqueVideo;
                    } else {
                        loadedVideos.push(videoFile);
                    }
                }
                var wikiPlayer = videojs(v, {'controls': true,'autoplay': false, 'preload': 'none', 'width':640, 'height':400, 'playbackRates': [1.0, 1.1, 1.2, 1.3, 1.4, 1.5, 2.0]});
                wikiPlayer.on('play', logPlayStart);
                wikiPlayer.on('pause', logStop);
                wikiPlayer.on('ended', logStop);
                userInstance.videoPlayers.push(wikiPlayer);
                counter++;

            });
        },300);
    };

    userInstance.login = function() {
        var uniqueSuffix = "?" + new Date().getTime();
        var php_script;
        var params = {};
        params.os = userInstance.ua;
        params.version = userInstance.version;

        //pathname = /app/wiki/index.php for LTI;

        if (location.pathname.indexOf("secure") != -1) {
            php_script = "saml_login.php";
        } else {
            php_script = "lti_login.php";
        }

        $http({method: 'POST',
            url: userInstance.appDir + 'php/' + php_script + uniqueSuffix,
            data: params,
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        }).
            success(function(data) {
                if (data.login_error === "NONE") {
                    if (!data.user_id || data.user_id == '0' || isNaN(parseInt(data.user_id))) {
                        userInstance.user.loginError = "Canvas access error. Refresh your browser or check your internet connection.";
                        return;
                    }
                    userInstance.user.word_count = parseInt(data.word_count);
                    userInstance.user.user_id = data.user_id;
                    userInstance.user.net_id = data.net_id;
                    userInstance.user.user_name = data.user_name;
                    userInstance.user.user_email = data.user_email;
                    userInstance.user.priv_level = parseInt(data.priv_level);
                    userInstance.user.toggle_level = 1;
                    userInstance.user.is_admin = userInstance.user.priv_level > 1;
                    userInstance.user.last_login = data.last_login;
                    userInstance.user.canvas_course_id = data.canvas_course_id;
                    userInstance.wiki.wiki_id = data.wiki_id;
                    userInstance.wiki.subscribed = data.subscribed;
                    userInstance.wiki.wiki_name = data.wiki_name;
                    userInstance.wiki.description = data.description;
                    userInstance.wiki.show_micro_posts = 1;
                    angular.forEach(data.pages, function(p) {
                        if (p.new_comments) {
                            p.new_posts = parseInt(p.new_posts) + parseInt(p.new_comments);
                        } else {
                            p.new_posts = parseInt(p.new_posts);
                        }
                        if (p.new_micros) {
                            p.new_posts += parseInt(p.new_micros);
                        }
                        p.prev = parseInt(p.prev);

                    });
                    userInstance.wiki.pages = data.pages;
                    //userInstance.wiki.headings = data.headings;
                    userInstance.wiki.use_versions = parseInt(data.use_versions) === 1;
                    userInstance.wiki.use_comments = parseInt(data.use_comments) === 1;
                    userInstance.wiki.use_anon = parseInt(data.use_anon) === 1;
                    userInstance.wiki.use_likes = parseInt(data.use_likes) === 1;
                    userInstance.wiki.add_pages = parseInt(data.add_pages) === 1;
                    userInstance.wiki.add_sections = parseInt(data.add_sections) === 1;
                    userInstance.wiki.max_posts = parseInt(data.max_posts);
                    userInstance.wiki.root_folder = data.root_folder;
                    userInstance.wiki.app_folder = data.app_folder;
                    userInstance.wiki.logo_link = data.logo_link;

                    userInstance.user.loginError = null;

                    if (userInstance.current.currentPage.page_id !== 0) {
                        userInstance.changePage(userInstance.current.currentPage.page_id);
                    } else if (data.page_id) {
                        //userInstance.changePage(data.page_id);
                        if (data.section_id && data.section_id !== 'null') {
                            $location.path("page/" + data.page_id + "/" + data.section_id);
                        } else {
                            $location.path("page/" + data.page_id);
                        }

                        //$window.scrollTo(0, 0);
                    }
                } else {
                    userInstance.user.loginError =  data.login_error;
                }
            }).
            error(function(data, status) {
                userInstance.user.loginError =  "Error: " + status + " Sign-in failed. Check your internet connection";
            });
    };

    userInstance.changePage = function(page_id) {
        angular.forEach(userInstance.videoPlayers, function(wikiPlayer) {
            if (wikiPlayer) {
                wikiPlayer.dispose();
            }
        });
        angular.forEach(userInstance.wiki.pages, function(page) {
            if (page.page_id == page_id) {
                page.is_open = true;
                userInstance.current.currentPage.page_id = page_id;
                userInstance.current.currentPage.page_name = page.page_name;
            } else {
                page.is_open = false;
            }
        });

        //var gaPage = userInstance.wiki.wiki_id + '-' + userInstance.current.currentPage.page_name;
        //$window.ga('send', 'pageview', { page: gaPage});

        var uniqueSuffix = "?" + new Date().getTime();
        var params = {};
        params.page_id = page_id;
        params.net_id = userInstance.user.net_id;
        params.last_login = userInstance.user.last_login;
        params.new_only = userInstance.wiki.new_only;
        params.show_micro_posts = userInstance.wiki.show_micro_posts;
        $http({method: 'POST',
            url: userInstance.appDir + 'php/getPage.php' + uniqueSuffix,
            data: params,
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        }).
            success(function(data) {
                angular.forEach(data.headings, function(h) {
                    h.num_posts = 0;
                    h.prev = parseInt(h.prev);
                });
                userInstance.wiki.headings = data.headings;

                var posts = [];
                var currentPost = {post_id:0, version:0, versions:[]};
                var last_version = {post_id:0, version:0};
                var last_comment = {post_id:0, comment_id:0, commentor_id:0};
                angular.forEach(data.posts, function(post) {
                    post.edit_date = utcStrToLocalDate(post.edit_date);
                    post.is_new = post.is_new === '1';
                    post.is_new_comment = post.is_new_comment === '1';
                    post.label = post.user_name + ' v' + post.version;
                    post.version = parseInt(post.version);
                    post.wc = parseInt(post.wc);
                    //post.post_txt = $sce.trustAsHtml(post.post_txt);
                    if (currentPost.post_id !== post.post_id) {
                        if (currentPost.post_id !== 0) {
                            posts.push(angular.copy(currentPost));
                        }
                        var heading = _.findWhere(userInstance.wiki.headings, {heading_id:post.heading_id});
                        heading.num_posts += 1;

                        currentPost = {post_id:post.post_id, is_new:post.is_new, likes:parseInt(post.likes), heading_id:post.heading_id, version:post.version, versions:[post], comments:[]};
                        last_version = {post_id:post.post_id, version:post.version};
                        last_comment = {post_id:post.post_id, comment_id:post.comment_id, is_new_comment:post.is_new_comment};
                        if (userInstance.wiki.use_comments && post.comment_id) {
                            post.comment_date = utcStrToLocalDate(post.comment_date);
                            currentPost.comments.push(post);
                        }
                    } else {
                        if (last_version.post_id === post.post_id && last_version.version !== post.version) {
                            currentPost.version = post.version;
                            currentPost.versions.push(post);
                            currentPost.is_new = post.is_new;
                            last_version = {post_id:post.post_id, version:post.version};
                        }
                        if (userInstance.wiki.use_comments && last_comment.comment_id && last_comment.comment_id !== post.comment_id) {
                            post.comment_date = utcStrToLocalDate(post.comment_date);
                            currentPost.comments.push(post);
                            last_comment.post_id = post.post_id;
                            last_comment.comment_id = post.comment_id;
                            last_comment.commentor_id = post.commentor_id;
                            last_comment.is_new_comment = post.is_new_comment;
                        }
                    }
                });
                if (currentPost.post_id !== 0) {
                    posts.push(currentPost);
                }
                angular.forEach(data.micro_posts, function(micro) {
                    micro.microDate = utcStrToLocalDate(micro.micro_date);
                    micro.is_new_micro = micro.is_new_micro === '1';
                    micro.can_edit = micro.user_id == userInstance.user.user_id || userInstance.user.priv_level > 1;
                });
                userInstance.wiki.micro_posts = data.micro_posts;
                userInstance.current.posts = posts;
                userInstance.initVideos();
            }).
            error(function(data, status) {
                alert("Error: " + status + " Get page failed. Check your internet connection");
            });
    };

    userInstance.getPageViews = function() {
        var uniqueSuffix = "?" + new Date().getTime();
        var params = {};
        var db_call = $http({method: 'POST',
            url: userInstance.appDir + 'php/getPageViews.php' + uniqueSuffix,
            data: params,
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        }).
            error(function(data, status) {
                alert("Error: " + status + " Get page views failed. Check your internet connection");
            });
        return db_call;
    };

    userInstance.email_post = function(post_txt, post_id, is_anon, heading_name, user_id) {
        var uniqueSuffix = "?" + new Date().getTime();
        var params = {};
        params.post_txt = post_txt;
        params.post_id = post_id;
        params.is_anon = is_anon;
        params.heading_name = heading_name;
        params.user_id = user_id;
        params.canvas_course_id = userInstance.user.canvas_course_id;
        $http({method: 'POST',
            url: userInstance.appDir + 'php/email_post.php' + uniqueSuffix,
            data: params,
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        }).
            success(function(data) {
                console.log(data);
            }).
            error(function(data, status) {
                alert("Error: " + status + " Email post failed. Check your internet connection");
            });
    };

    userInstance.toggleSubscribed = function() {
        var uniqueSuffix = "?" + new Date().getTime();
        var params = {};
        params.subscribed = userInstance.wiki.subscribed;
        params.user_id = userInstance.user.user_id;
        $http({method: 'POST',
            url: userInstance.appDir + 'php/toggleSubscribed.php' + uniqueSuffix,
            data: params,
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        }).
            success(function(data) {
                console.log(data);
            }).
            error(function(data, status) {
                alert("Error: " + status + " Toggle subscribed failed. Check your internet connection");
            });
    };

    return userInstance;
}]);

/*
wikiApp.directive("compileHtml", function($parse, $sce, $compile) {
    return {
        restrict: "A",
        link: function (scope, element, attributes) {

            var expression = $sce.parseAsHtml(attributes.compileHtml);

            var getResult = function () {
                return expression(scope);
            };

            scope.$watch(getResult, function (newValue) {
                console.log(newValue);
                var linker = $compile(newValue);
                console.log(linker(scope));
                element.append(linker(scope));
            });
        }
    }
});

wikiApp.directive('dynamic', function ($compile) {
    return {
        restrict: 'A',
        replace: true,
        link: function (scope, ele, attrs) {
            scope.$watch(attrs.dynamic, function(html) {
                ele.html(html);
                $compile(ele.contents())(scope);
            });
        }
    };
});
*/


wikiApp.directive('dynamic', function ($compile) {
        return {
            restrict: 'A',
            replace: true,
            scope: { dynamic: '=dynamic'},
            link: function postLink(scope, element, attrs) {
                scope.$watch( 'dynamic' , function(html){
                    element.html(html);
                    $compile(element.contents())(scope);
                });
            }
        };
    });



