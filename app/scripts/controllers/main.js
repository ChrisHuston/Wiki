'use strict';

angular.module('wikiApp')
  .controller('MainCtrl', function ($scope, $window, UserService, $http, $sce, $modal, $route, $anchorScroll, $location, $filter, $routeParams, $rootScope, $timeout) {
        $scope.wiki = UserService.wiki;
        $scope.user = UserService.user;
        $scope.current = UserService.current;

        $scope.deletePost = function(version, post) {

            var uniqueSuffix = "?" + new Date().getTime();
            var params = {};
            params.post_id = version.post_id;
            params.version = version.version;
            params.creator_id = version.creator_id;
            $http({method: 'POST',
                url: UserService.appDir + 'php/deletePost.php' + uniqueSuffix,
                data: params,
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).
                success(function() {
                    UserService.user.word_count -= parseInt(version.wc);
                    for (var i=0; i < post.versions.length; i++) {
                        if (post.versions[i].version === version.version) {
                            post.versions.splice(i,1);
                        }
                    }
                }).
                error(function(data, status) {
                    alert("Error: " + status + " Delete post failed. Check your internet connection");
                });
        };

        $scope.deleteMicro = function(post, micro) {
            var uniqueSuffix = "?" + new Date().getTime();
            var params = {};
            params.post_id = post.post_id;
            params.micro_id = micro.micro_id;
            params.user_id = micro.user_id;
            params.micro_date = micro.micro_date;
            $http({method: 'POST',
                url: UserService.appDir + 'php/deleteMicro.php' + uniqueSuffix,
                data: params,
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).
                success(function() {
                    UserService.user.word_count -= parseInt(micro.wc);
                    for (var i=0; i < $scope.wiki.micro_posts.length; i++) {
                        if ($scope.wiki.micro_posts[i].micro_date === micro.micro_date && $scope.wiki.micro_posts[i].user_id === micro.user_id && $scope.wiki.micro_posts[i].post_id === micro.post_id) {
                            $scope.wiki.micro_posts.splice(i,1);
                        }
                    }
                }).
                error(function(data, status) {
                    alert("Error: " + status + " Delete micro post failed. Check your internet connection");
                });
        };

        $scope.deleteComment = function(post_comment, post) {

            var uniqueSuffix = "?" + new Date().getTime();
            var params = {};
            params.post_id = post_comment.post_id;
            params.user_id = post_comment.commentor_id;
            params.comment_id = post_comment.comment_id;
            $http({method: 'POST',
                url: UserService.appDir + 'php/deleteComment.php' + uniqueSuffix,
                data: params,
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).
                success(function() {
                    UserService.user.word_count -= parseInt(post_comment.wc);
                    for (var i=0; i < post.comments.length; i++) {
                        if (post.comments[i].comment_id === post_comment.comment_id) {
                            post.comments.splice(i,1);
                        }
                    }
                }).
                error(function(data, status) {
                    alert("Error: " + status + " Delete comment failed. Check your internet connection");
                });
        };

        $scope.setNewPostBadge = function(new_posts) {
            if (new_posts < 1) {
                return "";
            } else {
                return "likes-mid";
            }
        };

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

        $scope.likePost = function(post) {
            var uniqueSuffix = "?" + new Date().getTime();
            var params = {};
            params.post_id = post.post_id;
            params.user_id = $scope.user.user_id;
            $http({method: 'POST',
                url: UserService.appDir + 'php/addLike.php' + uniqueSuffix,
                data: params,
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).
                success(function(data) {
                    if (data === "1") {
                        post.likes += 1;
                    } else if (data === "-1") {
                        alert("You have already liked this post.");
                    }
                }).
                error(function(data, status) {
                    alert("Error: " + status + " Like post failed. Check your internet connection");
                });
        };

        $scope.selectPage = function(page) {
            $location.path("page/" + page.page_id);
            $window.scrollTo(0, 0);
        };


        $scope.showPostModal = function (heading, post, version) {
            var modalInstance = $modal.open({
                templateUrl: 'postModal.html',
                controller: PostModalCtrl,
                backdrop: false,
                resolve: {
                    wiki: function() {
                        return $scope.wiki;
                    },
                    headings: function() {
                        return $filter('filter')($scope.wiki.headings, {page_id:$scope.current.currentPage.page_id});
                    },
                    heading: function () {
                        return heading;
                    },
                    page_id: function() {
                        return $scope.current.currentPage.page_id;
                    },
                    post: function() {
                        return post;
                    },
                    version: function() {
                        return version;
                    },
                    posts: function() {
                        return $scope.current.posts;
                    },
                    flow: function() {
                        return $scope;
                    }
                }
            });
            modalInstance.result.then(function () {

            });
        };

        $scope.showMicroModal = function (heading, post, version, micro, micro_id) {
            var modalInstance = $modal.open({
                templateUrl: 'microModal.html',
                controller: MicroModalCtrl,
                backdrop: false,
                resolve: {
                    wiki: function() {
                        return $scope.wiki;
                    },
                    headings: function() {
                        return $filter('filter')($scope.wiki.headings, {page_id:$scope.current.currentPage.page_id});
                    },
                    heading: function () {
                        return heading;
                    },
                    page_id: function() {
                        return $scope.current.currentPage.page_id;
                    },
                    post: function() {
                        return post;
                    },
                    version: function() {
                        return version;
                    },
                    micro: function() {
                        return micro;
                    },
                    micro_id: function() {
                        return micro_id;
                    },
                    posts: function() {
                        return $scope.current.posts;
                    },
                    flow: function() {
                        return $scope;
                    }
                }
            });
            modalInstance.result.then(function () {

            });
        };

        $scope.showCommentModal = function (heading, post, post_comment) {
            var modalInstance = $modal.open({
                templateUrl: 'commentModal.html',
                controller: CommentModalCtrl,
                backdrop: false,
                resolve: {
                    wiki: function() {
                        return $scope.wiki;
                    },
                    headings: function() {
                        return $filter('filter')($scope.wiki.headings, {page_id:$scope.current.currentPage.page_id});
                    },
                    heading: function () {
                        return heading;
                    },
                    page_id: function() {
                        return $scope.current.currentPage.page_id;
                    },
                    post: function() {
                        return post;
                    },
                    post_comment: function() {
                        return post_comment;
                    },
                    posts: function() {
                        return $scope.current.posts;
                    },
                    flow: function() {
                        return $scope;
                    }

                }
            });

            modalInstance.result.then(function () {

            });
        };

        $scope.showHeadingModal = function (page, heading) {
            var modalInstance = $modal.open({
                templateUrl: 'headingModal.html',
                controller: HeadingModalCtrl,
                backdrop: false,
                resolve: {
                    page: function () {
                        return page;
                    },
                    heading: function() {
                        return heading;
                    }
                }
            });

            modalInstance.result.then(function () {

            });
        };

        var safe_name;
        $scope.addedUpload = function(flowFile) {
            safe_name = flowFile.name;
            safe_name = safe_name.replace(/ /g, '_');
            safe_name = safe_name.replace(/#/g, '');
            $scope.flow_config.query.media_name = safe_name;

            flowFile.flowObj.query = {};
            flowFile.flowObj.query.media_path = $scope.flow_config.query.media_path;
            flowFile.flowObj.query.user_id = UserService.user.user_id;
            flowFile.flowObj.query.wiki_id = UserService.wiki.wiki_id;
            flowFile.flowObj.query.page_id = UserService.current.currentPage.page_id.page_id;
            flowFile.flowObj.query.heading_id = $scope.flow_config.query.heading_id;
            flowFile.flowObj.query.type_id = $scope.flow_config.query.type_id;
            flowFile.flowObj.query.media_name = safe_name;

            console.log(flowFile.flowObj);
            console.log(flowFile, safe_name);

            flowFile.name = safe_name;
            //flowFile.flowObj.query = {'course_id':UserService.admin.course_id};
        };

        $scope.insertUpload = function(tag) {
            tinyMCE.activeEditor.execCommand('mceInsertContent', false, tag);
        };


        $scope.uploadComplete = function(file_type) {
            var uploadPath = 'https://www.kblocks.com/app/wiki/';
            var file_path = uploadPath + "uploads/w" + UserService.wiki.wiki_id + "/u" + UserService.user.user_id + "/";
            var media_name = safe_name;
            var full_path = file_path + media_name;
            var tag = "";
            if (file_type === 'video') {
                tag = "<video class=\"t-wiki-video video-js vjs-default-skin vjs-big-play-centered img-responsive\" src=\"" + full_path + "\" type=\"video/mp4\" controls preload=\"none\"></video>";
            } else if (file_type === 'img') {
                tag = "<img src=\"" + full_path + "\" class=\"img-responsive\" alt=\"" + media_name + "\"></img>";
            } else {
                tag = "<a href=\"" + full_path + "\" target=\"_blank\">" + media_name + "</a>";
            }
            $scope.insertUpload(tag);
        };

        $scope.flow_config = {
            target: UserService.appDir + 'php/fileUpload.php',
            testChunks:false,
            query:{}
        };

        $scope.initFlowQuery = function(heading_id, type_id)  {
            if (UserService.appDir === "https://www.kblocks.com/app/wiki/") {
                var media_path = "app/wiki/uploads/w"+ UserService.wiki.wiki_id + "/u" + UserService.user.user_id;
            } else {
                media_path = "wiki/uploads/w"+ UserService.wiki.wiki_id + "/u" + UserService.user.user_id;
            }

            $scope.flow_config.query.media_path = media_path;
            $scope.flow_config.query.user_id = UserService.user.user_id;
            $scope.flow_config.query.wiki_id = UserService.wiki.wiki_id;
            $scope.flow_config.query.page_id = UserService.current.currentPage.page_id;
            $scope.flow_config.query.heading_id = heading_id;
            $scope.flow_config.query.type_id = type_id;
            //$scope.flow_config.query.media_name = safe_name;
        };

        $scope.showPageModal = function () {
            var modalInstance = $modal.open({
                templateUrl: 'pageModal.html',
                controller: PageModalCtrl,
                backdrop: false
            });

            modalInstance.result.then(function () {

            });
        };

        $scope.toggleSubscribed = function() {
            UserService.toggleSubscribed();
        };

        $scope.gotoSection = function(anchor_id) {
            var old_hash = $location.hash();
            $location.hash(anchor_id);
            $anchorScroll();
            $location.hash(old_hash);
        };

        $scope.toggleMicroPosts = function() {
            if ($scope.current.currentPage.page_id !== 0) {
                UserService.changePage($scope.current.currentPage.page_id);
            }
        };

        $scope.toggleNewPosts = function() {
            if ($scope.current.currentPage.page_id !== 0) {
                UserService.changePage($scope.current.currentPage.page_id);
            }
        };

        if ($routeParams.hasOwnProperty("page_id")) {
            var page_id = parseInt($routeParams.page_id);
            if (page_id !== parseInt($scope.current.currentPage.page_id)) {
                if ($scope.wiki.pages.length === 0) {
                    $scope.current.currentPage.page_id = page_id;
                } else {
                    UserService.changePage(page_id);
                    if ($routeParams.hasOwnProperty("post_id")) {
                        $timeout(function() {
                            $scope.gotoSection($routeParams.post_id);
                        }, 250);
                    } else if ($routeParams.hasOwnProperty("heading_id") && $routeParams.heading_id) {
                        $timeout(function() {
                            var anchor_id = "sect_" + page_id + "_" + $routeParams.heading_id;
                            $scope.gotoSection(anchor_id);
                        }, 250);
                    }
                }
            } else {
                if ($routeParams.hasOwnProperty("heading_id")) {
                    $timeout(function() {
                        var anchor_id = "sect_" + page_id + "_" + $routeParams.heading_id;
                        $scope.gotoSection(anchor_id);
                    });
                }
            }
        }

  });



var PostModalCtrl = function ($scope, $location, $modalInstance, wiki, headings, heading, page_id, post, version, posts, flow, $timeout, $http, UserService) {
    $scope.page_id = page_id;
    $scope.wiki = wiki;
    $scope.post = post;
    $scope.version = version;
    $scope.heading = heading;
    $scope.pages = wiki.pages;
    $scope.headings = headings;
    $scope.posts = posts;
    $scope.user = UserService.user;
    $scope.new_version = UserService.user.priv_level < 2 && UserService.wiki.use_versions;
    $scope.flow = flow;

    $scope.ok = function () {
        $modalInstance.close();
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };

    $scope.insertPageLink = function(page) {
        var selection = tinymce.activeEditor.selection.getContent();
        var appPath = '';
        if (selection) {
            pageLink = '<a href="' + appPath + '#/page/'+ page.page_id + '">' + selection + "</a>";
            tinyMCE.activeEditor.selection.setContent(pageLink);
        } else {
            var pageLink = '<a href="' + appPath + '#/page/'+ page.page_id + '">' + page.page_name + "</a>";
            tinyMCE.activeEditor.execCommand('mceInsertContent', false, pageLink);
        }
    };

    $scope.insertSectionLink = function(heading) {
        var selection = tinymce.activeEditor.selection.getContent();
        var appPath = '';
        if (selection) {
            sectionLink = '<a href="' + appPath + '#/page/'+ $scope.page_id + '/' + heading.heading_id + '">' + selection + "</a>";
            tinyMCE.activeEditor.selection.setContent(sectionLink);
        } else {
            var sectionLink = '<a href="' + appPath + '#/page/'+ $scope.page_id + '/' + heading.heading_id + '">' + heading.heading_name + "</a>";
            tinyMCE.activeEditor.execCommand('mceInsertContent', false, sectionLink);
        }
    };

    $scope.insertMicro = function(post) {
        var microId = parseInt(Date.now()/1000) - 1418447800;
        var microBtn = '<button class="btn btn-link" data-ng-click="$parent.showMicroModal($parent.heading, $parent.post, $parent.v, {is_new:true, is_anon:\'0\'},' + microId + ')"><i class="fa fa-chevron-down"></i> Insert</button>';
        microBtn += '<div data-ng-repeat="micro in $parent.wiki.micro_posts | filter:{post_id:$parent.v.post_id, micro_id:' + microId + '}">';
        microBtn += '<div class="pull-right" data-ng-show="micro.is_new_micro" style="color:steelblue;">&nbsp;<i class="fa fa-star"></i></div>';
        microBtn += '<div data-ng-bind-html="micro.micro_txt">';
        microBtn += '</div>';
        microBtn += '<div class="text-muted micro-user-name">';
        microBtn += '<span data-ng-show="micro.is_anon==\'0\' || $parent.$parent.user.priv_level>1">{{micro.user_name}},</span><span> {{micro.microDate | date:"MMM dd, \'yy hh:mm a"}}</span><span data-ng-show="micro.is_anon==\'1\'"><sup> ANON</sup></span>';
        microBtn += '<button data-ng-show="micro.can_edit" class="btn btn-link" data-ng-click="$parent.$parent.showMicroModal($parent.$parent.heading, $parent.$parent.post, $parent.$parent.v, micro)"><i class="fa fa-edit"></i> Edit</button>';
        microBtn += '<button data-ng-show="micro.can_edit" class="btn btn-link pull-right" data-ng-click="$parent.$parent.deleteMicro($parent.$parent.post, micro)"><i class="fa fa-trash-o"></i></button>';
        microBtn += '</div>';
        microBtn += '</div>';
        tinyMCE.activeEditor.execCommand('mceInsertContent', false, microBtn);
    };

    $scope.insertUpload = function(tag) {
        tinyMCE.activeEditor.execCommand('mceInsertContent', false, tag);
    };

    var countWords = function(html) {
        var div = document.createElement("div");
        div.innerHTML = html;
        var str = div.textContent || div.innerText || "";
        str = str.trim();
        return str.split(/\s+\b/).length;
    };

    $scope.submitPost = function(previous_student) {
        var post_txt = tinyMCE.activeEditor.getContent();
        if (post_txt === "") {
            alert("Empty entries are not allowed. Please enter some text before clicking submit.");
            return;
        }
        var offset = 1394078272610;
        var uniqueSuffix = "?" + new Date().getTime();
        var params = {};
        params.post_txt = post_txt;

        if (previous_student) {
            params.creator_id = 0;
        } else {
            params.creator_id = UserService.user.user_id;
        }
        params.wiki_id = UserService.wiki.wiki_id;
        params.page_id = page_id;
        params.heading_id = $scope.heading.heading_id;
        params.is_anon = $scope.version.is_anon;

        if (post.post_id) {
            params.post_id = post.post_id;
            if (!$scope.new_version) {
                if (UserService.user.user_id === $scope.version.creator_id) {
                    params.update_date = 1;
                } else {
                    params.update_date = 0;
                }
                params.wc = countWords(params.post_txt);
                UserService.user.word_count += params.wc - parseInt($scope.version.wc);
                params.version = $scope.version.version;
                $http({method: 'POST',
                    url: UserService.appDir + 'php/editPost.php' + uniqueSuffix,
                    data: params,
                    headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                }).
                    success(function() {
                        $scope.version.post_txt = post_txt;
                        $scope.version.wc = params.wc;
                        if (params.update_date === 1) {
                            $scope.version.edit_date = new Date();
                        }
                        $modalInstance.close();
                    }).
                    error(function(data, status) {
                        alert("Error: " + status + " Edit post failed. Check your internet connection");
                    });
            } else {
                params.wc = countWords(params.post_txt) - countWords(version.post_txt);
                UserService.user.word_count += params.wc;
                params.version = parseInt(post.versions[post.versions.length-1].version) + 1;
                $http({method: 'POST',
                    url: UserService.appDir + 'php/addPost.php' + uniqueSuffix,
                    data: params,
                    headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                }).
                    success(function() {
                        //post.post_txt = post_txt;
                        params.edit_date = new Date();
                        params.creation_date = params.edit_date;
                        if (previous_student) {
                            params.user_name = "Previous Student";
                        } else {
                            params.user_name = UserService.user.user_name;
                        }
                        params.user_email = UserService.user.user_email;
                        params.label = params.user_name + ' v' + params.version;
                        post.version = params.version;
                        post.versions.push(params);
                        UserService.email_post(params.post_txt, params.post_id, params.is_anon, $scope.heading.heading_name, params.creator_id);
                        $modalInstance.close();
                    }).
                    error(function(data, status) {
                        alert("Error: " + status + " Edit post failed. Check your internet connection");
                    });
            }
        } else {
            params.post_id = new Date().getTime() - offset;
            params.version = 1;
            params.wc = countWords(params.post_txt);
            UserService.user.word_count += params.wc;

            $http({method: 'POST',
                url: UserService.appDir + 'php/addPost.php' + uniqueSuffix,
                data: params,
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).
                success(function() {
                    //params.post_id = data.post_id;
                    params.prev = 0;
                    params.edit_date = new Date();
                    if (previous_student) {
                        params.user_name = "Previous Student";
                    } else {
                        params.user_name = UserService.user.user_name;
                    }
                    params.label = params.user_name + ' v' + params.version;
                    params.user_email = UserService.user.user_email;
                    params.creation_date = params.edit_date;
                    var newPost = {version:params.version, heading_id:params.heading_id, post_id:params.post_id, comments:[], versions:[params]};
                    $scope.posts.push(newPost);
                    UserService.email_post(params.post_txt, params.post_id, params.is_anon, $scope.heading.heading_name, params.creator_id);
                    $modalInstance.close();
                }).
                error(function(data, status) {
                    alert("Error: " + status + " Add post failed. Check your internet connection");
                });
        }

    };

    $modalInstance.opened.then(function() {
        var viewport = {width: $(window).width()-50, height: $(window).height()-50};
        var w = Math.min(viewport.width, 780);
        var h = Math.min(viewport.height, 510);

        $timeout(function() {
            var popup = $(".modal-content");
            var dialog = $(".modal-dialog");
            //popup.draggable({ containment: "window" });

            if (viewport.width < 600) {
                var height_offset = 285;
            } else {
                height_offset = 255;
            }
            popup.resizable({aspectRatio: false,
                start: function( event, ui ) {ui.element.css("position","fixed")},
                resize:function(event, ui) {
                    var resizeHeight = ui.size.height-height_offset;
                    tinyMCE.DOM.setStyle(tinyMCE.DOM.get("wiki-postTxt" + '_ifr'), 'height', resizeHeight + 'px');
                },
                stop: function( event, ui ) {ui.element.css("position","fixed")}});

            var ed2 = new tinymce.Editor('wiki-postTxt', {
                selector: "textarea",
                menubar: false,
                statusbar: false,
                relative_urls: false,
                remove_script_host: false,
                auto_focus: "wiki-postTxt",
                extended_valid_elements : "a[class|href|id|download|type|target|target=_blank|section-link|ng-click],i[class|style]",
                target_list: [
                    {title: 'New page', value: '_blank'},
                    {title: 'Same page', value: '_self'}
                ],
                content_css : "https://www.kblocks.com/app/wiki/styles/tiny_style.css",
                formats: {custom_format : {table : 'table', classes: "table table-condensed table-bordered table-striped"}},
                plugins: [
                    "advlist autolink lists link charmap",
                    "searchreplace visualblocks code",
                    "insertdatetime table paste textcolor"
                ],
                toolbar: "bold italic forecolor backcolor | subscript superscript | styleselect | bullist numlist table outdent indent | link charmap code"
            }, tinymce.EditorManager);

            ed2.render();

            if (version && version.post_txt) {
                setTimeout(function() {
                    tinymce.get('wiki-postTxt').setContent(version.post_txt);
                }, 500);
            }

            popup.css('width', w+"px");
            popup.css('height', h+"px");
            //popup.css('left', "10px");
            dialog.css('width', w+"px");
            dialog.css('height', h+"px");
            //dialog.css('left', "10px");
            tinyMCE.DOM.setStyle(tinyMCE.DOM.get("wiki-postTxt" + '_ifr'), 'height', h - height_offset + 'px');
        }, 500);
    });

};

var MicroModalCtrl = function ($scope, $location, $modalInstance, wiki, headings, heading, page_id, post, version, micro, micro_id, posts, flow, $timeout, $http, UserService) {
    $scope.page_id = page_id;
    $scope.wiki = wiki;
    $scope.post = post;
    $scope.micro = micro;
    $scope.heading = heading;
    $scope.pages = wiki.pages;
    $scope.headings = headings;
    $scope.posts = posts;
    $scope.user = UserService.user;
    $scope.flow = flow;


    $scope.ok = function () {
        $modalInstance.close();
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };

    $scope.insertPageLink = function(page) {
        var selection = tinymce.activeEditor.selection.getContent();
        if (selection) {
            pageLink = '<a href="#/page/'+ page.page_id + '" target="_self">' + selection + "</a>";
            tinyMCE.activeEditor.selection.setContent(pageLink);
        } else {
            var pageLink = '<a href="#/page/'+ page.page_id + '" target="_self">' + page.page_name + "</a>";
            tinyMCE.activeEditor.execCommand('mceInsertContent', false, pageLink);
        }
    };

    $scope.insertSectionLink = function(heading) {
        var selection = tinymce.activeEditor.selection.getContent();
        if (selection) {
            sectionLink = '<a href="#/page/'+ $scope.page_id + '/' + heading.heading_id + '" target="_self">' + selection + "</a>";
            tinyMCE.activeEditor.selection.setContent(sectionLink);
        } else {
            var sectionLink = '<a href="#/page/'+ $scope.page_id + '/' + heading.heading_id + '" target="_self">' + heading.heading_name + "</a>";
            tinyMCE.activeEditor.execCommand('mceInsertContent', false, sectionLink);
        }
    };

    $scope.insertUpload = function(tag) {
        tinyMCE.activeEditor.execCommand('mceInsertContent', false, tag);
    };

    var countWords = function(html) {
        var div = document.createElement("div");
        div.innerHTML = html;
        var str = div.textContent || div.innerText || "";
        str = str.trim();
        return str.split(/\s+\b/).length;
    };

    $scope.submitMicro = function() {
        var micro_txt = tinyMCE.activeEditor.getContent();
        if (micro_txt === "") {
            alert("Empty entries are not allowed. Please enter some text before clicking submit.");
            return;
        }
        var uniqueSuffix = "?" + Date.now();
        var params = {};
        params.micro_txt = micro_txt;
        params.user_id = UserService.user.user_id;
        params.wiki_id = UserService.wiki.wiki_id;
        params.page_id = page_id;
        params.heading_id = $scope.heading.heading_id;
        params.is_anon = $scope.micro.is_anon;
        params.post_id = post.post_id;
        params.micro_id = micro_id;

        if (!micro.is_new) {
            if (UserService.user.user_id === micro.user_id) {
                params.update_date = 1;
            } else {
                params.update_date = 0;
            }
            params.wc = countWords(params.micro_txt);
            UserService.user.word_count += params.wc - parseInt(micro.wc);
            params.micro_id = $scope.micro.micro_id;
            params.micro_date = micro.micro_date;
            $http({method: 'POST',
                url: UserService.appDir + 'php/editMicro.php' + uniqueSuffix,
                data: params,
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).
                success(function() {
                    micro.micro_txt = micro_txt;
                    micro.wc = params.wc;
                    if (params.update_date === 1) {
                        micro.micro_date = new Date();
                    }
                    version.post_txt = version.post_txt + ' ';
                    $modalInstance.close();
                }).
                error(function(data, status) {
                    alert("Error: " + status + " Edit post failed. Check your internet connection");
                });
        } else {
            params.wc = countWords(params.micro_txt);
            UserService.user.word_count += params.wc;

            $http({method: 'POST',
                url: UserService.appDir + 'php/addMicro.php' + uniqueSuffix,
                data: params,
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).
                success(function() {
                    //params.post_id = data.post_id;
                    params.microDate = new Date();
                    params.user_name = UserService.user.user_name;
                    params.user_email = UserService.user.user_email;
                    UserService.wiki.micro_posts.push(params);
                    version.post_txt = version.post_txt + ' ';
                    UserService.email_post(params.micro_txt, params.post_id, params.is_anon, $scope.heading.heading_name, params.user_id);
                    $modalInstance.close();
                }).
                error(function(data, status) {
                    alert("Error: " + status + " Add micro failed. Check your internet connection");
                });
        }

    };

    $modalInstance.opened.then(function() {
        var viewport = {width: $(window).width()-50, height: $(window).height()-50};
        var w = Math.min(viewport.width, 780);
        var h = Math.min(viewport.height, 510);

        $timeout(function() {
            var popup = $(".modal-content");
            var dialog = $(".modal-dialog");
            //popup.draggable({ containment: "window" });

            if (viewport.width < 600) {
                var height_offset = 285;
            } else {
                height_offset = 255;
            }
            popup.resizable({aspectRatio: false,
                start: function( event, ui ) {ui.element.css("position","fixed")},
                resize:function(event, ui) {
                    var resizeHeight = ui.size.height-height_offset;
                    tinyMCE.DOM.setStyle(tinyMCE.DOM.get("wiki-microTxt" + '_ifr'), 'height', resizeHeight + 'px');
                },
                stop: function( event, ui ) {ui.element.css("position","fixed")}});

            var ed2 = new tinymce.Editor('wiki-microTxt', {
                selector: "textarea",
                menubar: false,
                statusbar: false,
                relative_urls: false,
                remove_script_host: false,
                auto_focus: "wiki-microTxt",
                extended_valid_elements : "a[class|href|id|download|type|target|target=_blank|section-link|ng-click],i[class|style]",
                target_list: [
                    {title: 'New page', value: '_blank'},
                    {title: 'Same page', value: '_self'}
                ],
                content_css : "https://www.kblocks.com/app/wiki/styles/tiny_style.css",
                formats: {custom_format : {table : 'table', classes: "table table-condensed table-bordered table-striped"}},
                plugins: [
                    "advlist autolink lists link charmap",
                    "searchreplace visualblocks code",
                    "insertdatetime table paste textcolor"
                ],
                toolbar: "bold italic forecolor backcolor | subscript superscript | styleselect | bullist numlist table outdent indent | link charmap code"
            }, tinymce.EditorManager);

            ed2.render();

            if (micro.micro_txt) {
                setTimeout(function() {
                    tinymce.get('wiki-microTxt').setContent(micro.micro_txt);
                }, 500);
            }

            popup.css('width', w+"px");
            popup.css('height', h+"px");
            //popup.css('left', "10px");
            dialog.css('width', w+"px");
            dialog.css('height', h+"px");
            //dialog.css('left', "10px");
            tinyMCE.DOM.setStyle(tinyMCE.DOM.get("wiki-microTxt" + '_ifr'), 'height', h - height_offset + 'px');
        }, 500);
    });

};


var CommentModalCtrl = function ($scope, $location, $modalInstance, wiki, headings, heading, page_id, post, post_comment, posts, flow, $timeout, $http, UserService) {
    $scope.wiki = wiki;
    $scope.page_id = page_id;
    $scope.post = post;
    $scope.heading = heading;
    $scope.post_comment = post_comment;
    $scope.pages = wiki.pages;
    $scope.headings = headings;
    $scope.posts = posts;
    $scope.user = UserService.user;
    $scope.flow = flow;

    $scope.ok = function () {
        $modalInstance.close();
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };

    $scope.insertPageLink = function(page) {
        var selection = tinymce.activeEditor.selection.getContent();
        if (selection) {
            pageLink = '<a href="#/page/'+ page.page_id + '" target="_self">' + selection + "</a>";
            tinyMCE.activeEditor.selection.setContent(pageLink);
        } else {
            var pageLink = '<a href="#/page/'+ page.page_id + '" target="_self">' + page.page_name + "</a>";
            tinyMCE.activeEditor.execCommand('mceInsertContent', false, pageLink);
        }
    };

    $scope.insertSectionLink = function(heading) {
        var selection = tinymce.activeEditor.selection.getContent();
        if (selection) {
            sectionLink = '<a href="#/page/'+ $scope.page_id + '/' + heading.heading_id + '" target="_self">' + selection + "</a>";
            tinyMCE.activeEditor.selection.setContent(sectionLink);
        } else {
            var sectionLink = '<a href="#/page/'+ $scope.page_id + '/' + heading.heading_id + '" target="_self">' + heading.heading_name + "</a>";
            tinyMCE.activeEditor.execCommand('mceInsertContent', false, sectionLink);
        }
    };

    $scope.insertUpload = function(tag) {
        tinyMCE.activeEditor.execCommand('mceInsertContent', false, tag);
    };

    var countWords = function(html) {
        var div = document.createElement("div");
        div.innerHTML = html;
        var str = div.textContent || div.innerText || "";
        str = str.trim();
        return str.split(/\s+\b/).length;
    };

    $scope.submitComment = function() {
        var comment_txt = tinyMCE.activeEditor.getContent();
        if (comment_txt === "") {
            alert("Empty entries are not allowed. Please enter some text before clicking submit.");
            return;
        }
        var offset = 1394078272610;
        var uniqueSuffix = "?" + new Date().getTime();
        var params = {};
        params.comment_txt = comment_txt;
        params.post_id = $scope.post.post_id;
        params.user_id = UserService.user.user_id;
        if (post_comment.anon_comment) {
            params.is_anon = post_comment.anon_comment;
        } else {
            params.is_anon = '0';
        }

        params.wc = countWords(params.comment_txt);


        if (post_comment.comment_id) {
            UserService.user.word_count += params.wc - parseInt(post_comment.wc);
            params.comment_id = post_comment.comment_id;
            params.user_id = post_comment.commentor_id;
            $http({method: 'POST',
                url: UserService.appDir + 'php/editComment.php' + uniqueSuffix,
                data: params,
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).
                success(function() {
                    $scope.post_comment.comment_txt = comment_txt;
                    $scope.post_comment.comment_date = new Date();
                    $scope.post_comment.wc = params.wc;
                    if (params.is_anon === '1') {
                        $scope.post_comment.commentor = "anonymous";
                    }
                    $modalInstance.close();
                }).
                error(function(data, status) {
                    alert("Error: " + status + " Edit comment failed. Check your internet connection");
                });
        } else {
            UserService.user.word_count += params.wc;
            params.comment_id = new Date().getTime() - offset;
            params.heading_id = $scope.heading.heading_id;
            params.page_id = $scope.page_id;

            $http({method: 'POST',
                url: UserService.appDir + 'php/addComment.php' + uniqueSuffix,
                data: params,
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).
                success(function() {
                    //params.post_id = data.post_id;
                    params.comment_date = new Date();
                    params.commentor_id = params.user_id;
                    if (params.is_anon === '1') {
                        params.commentor = "anonymous";
                    } else {
                        params.commentor = UserService.user.user_name;
                    }
                    $scope.post.comments.push(params);
                    UserService.email_post(params.comment_txt, params.post_id, params.is_anon, $scope.heading.heading_name, params.user_id);
                    $modalInstance.close();
                }).
                error(function(data, status) {
                    alert("Error: " + status + " Add comment failed. Check your internet connection");
                });
        }
    };

    $modalInstance.opened.then(function() {
        var viewport = {width: $(window).width()-50, height: $(window).height()-50};
        var w = Math.min(viewport.width, 730);
        var h = Math.min(viewport.height, 510);

        $timeout(function() {
            var popup = $(".modal-content");
            var dialog = $(".modal-dialog");
            //popup.draggable({ containment: "window" });

            if (viewport.width < 600) {
                var height_offset = 285;
            } else {
                height_offset = 255;
            }
            popup.resizable({aspectRatio: false,
                start: function( event, ui ) {ui.element.css("position","fixed")},
                resize:function(event, ui) {
                    var resizeHeight = ui.size.height-height_offset;
                    tinyMCE.DOM.setStyle(tinyMCE.DOM.get("wiki-commentTxt" + '_ifr'), 'height', resizeHeight + 'px');
                },
                stop: function( event, ui ) {ui.element.css("position","fixed")}});

            var ed2 = new tinymce.Editor('wiki-commentTxt', {
                selector: "textarea",
                menubar: false,
                statusbar: false,
                relative_urls: false,
                remove_script_host: false,
                auto_focus: "wiki-commentTxt",
                extended_valid_elements : "a[class|href|id|download|type|target|target=_blank|section-link|ng-click],i[class|style]",
                target_list: [
                    {title: 'New page', value: '_blank'},
                    {title: 'Same page', value: '_self'}
                ],
                content_css : "https://www.kblocks.com/app/wiki/styles/tiny_style.css",
                formats: {custom_format : {table : 'table', classes: "table table-condensed table-bordered table-striped"}},
                plugins: [
                    "advlist autolink lists link charmap",
                    "searchreplace visualblocks code",
                    "insertdatetime table paste textcolor"
                ],
                toolbar: "bold italic forecolor backcolor | subscript superscript | styleselect | bullist numlist table outdent indent | link charmap code"
            }, tinymce.EditorManager);

            ed2.render();

            if (post_comment && post_comment.comment_txt) {
                setTimeout(function() {
                    tinymce.get('wiki-commentTxt').setContent(post_comment.comment_txt);
                }, 500);
            }

            popup.css('width', w+"px");
            popup.css('height', h+"px");
            //popup.css('left', "10px");
            dialog.css('width', w+"px");
            dialog.css('height', h+"px");
            //dialog.css('left', "10px");
            tinyMCE.DOM.setStyle(tinyMCE.DOM.get("wiki-commentTxt" + '_ifr'), 'height', h - height_offset + 'px');
        }, 500);
    });

};


var HeadingModalCtrl = function ($scope, $modalInstance, page, heading, $http, UserService, $timeout) {

    $scope.page = page;
    $scope.heading = heading;

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };

    $scope.submitHeading = function() {
        var heading_name = $scope.heading.heading_name;
        if (heading_name === "") {
            alert("Empty entries are not allowed. Please enter some text before clicking submit.");
            return;
        }
        var uniqueSuffix = "?" + new Date().getTime();
        var params = {};
        params.heading_name = heading_name;
        if (heading.heading_id) {
            params.heading_id = heading.heading_id;
            $http({method: 'POST',
                url: UserService.appDir + 'php/editHeading.php' + uniqueSuffix,
                data: params,
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).
                success(function() {
                    heading.heading_name = heading_name;
                    $modalInstance.close();
                }).
                error(function(data, status) {
                    alert("Error: " + status + " Edit heading failed. Check your internet connection");
                });
        } else {
            params.creator_id = UserService.user.user_id;
            params.wiki_id = UserService.wiki.wiki_id;
            params.page_id = $scope.page.page_id;

            $http({method: 'POST',
                url: UserService.appDir + 'php/addHeading.php' + uniqueSuffix,
                data: params,
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).
                success(function(data) {
                    params.heading_id = data.heading_id;
                    params.prev = 0;
                    params.creation_date = new Date();
                    params.user_name = UserService.user.user_name;
                    params.user_email = UserService.user.user_email;
                    UserService.wiki.headings.push(params);
                    $modalInstance.close();
                }).
                error(function(data, status) {
                    alert("Error: " + status + " Add heading failed. Check your internet connection");
                });
        }
    };

    $modalInstance.opened.then(function() {
        $timeout(function() {
            document.getElementById("headingInput").focus();
        },500);
    });

};

var PageModalCtrl = function ($scope, $modalInstance, $http, UserService, $timeout) {
    $scope.page = {page_name:""};

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };

    $scope.submitPage = function() {
        var page_name = $scope.page.page_name;
        if (page_name === "") {
            alert("Empty entries are not allowed. Please enter some text before clicking submit.");
            return;
        }
        var uniqueSuffix = "?" + new Date().getTime();
        var params = {};
        params.page_name = page_name;
        params.creator_id = UserService.user.user_id;
        params.wiki_id = UserService.wiki.wiki_id;

        $http({method: 'POST',
            url: UserService.appDir + 'php/addPage.php' + uniqueSuffix,
            data: params,
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        }).
            success(function(data) {
                params.page_id = data.page_id;
                params.prev = 0;
                params.creation_date = new Date();
                params.user_name = UserService.user.user_name;
                params.user_email = UserService.user.user_email;
                UserService.wiki.pages.push(params);
                $modalInstance.close();
            }).
            error(function(data, status) {
                alert("Error: " + status + " Add page failed. Check your internet connection");
            });
    };

    $modalInstance.opened.then(function() {
        $timeout(function() {
            document.getElementById("pageInput").focus();
        },500);

    });

};
