'use strict';

angular.module('wikiApp')
  .controller('AdminCtrl', function ($scope, UserService, $http, $location, $modal) {
        if (UserService.wiki.wiki_id === 0 || UserService.user.priv_level < 2) {
            $location.path('/');
            return;
        }
        $scope.wiki = UserService.wiki;

        var ed3 = new tinymce.Editor('wiki-description', {
            selector: "textarea.editme",
            inline: false,
            menubar: false,
            statusbar: false,
            relative_urls: false,
            remove_script_host: false,
            content_css : "https://www.kblocks.com/app/wiki/styles/tiny_style.css",
            plugins: [
                "advlist autolink lists link charmap",
                "searchreplace visualblocks code",
                "insertdatetime paste textcolor"
            ],
            toolbar: "bold italic | styleselect | bullist numlist outdent indent | link charmap code"
        }, tinymce.EditorManager);

        ed3.render();
        tinymce.get('wiki-description').setContent($scope.wiki.description);

        $scope.editWikiName = function() {
            $scope.wiki.changed = true;
        };

        $scope.editLogoLink = function() {
            $scope.wiki.changed_link = true;
        };

        $scope.toggleWikiSettings = function() {
            var uniqueSuffix = "?" + new Date().getTime();
            var params = {};
            params.use_versions = $scope.wiki.use_versions;
            params.use_comments = $scope.wiki.use_comments;
            params.use_anon = $scope.wiki.use_anon;
            params.use_likes = $scope.wiki.use_likes;
            params.add_pages = $scope.wiki.add_pages;
            params.add_sections = $scope.wiki.add_sections;
            params.max_posts = $scope.wiki.max_posts;
            $http({method: 'POST',
                url: UserService.appDir+ 'php/editWikiSettings.php' + uniqueSuffix,
                data: params,
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).
                success(function() {

                }).
                error(function(data, status) {
                    alert("Error: " + status + " Edit wiki settings failed. Check your internet connection");
                });
        };

        $scope.editWikiNameDone = function() {
            if ($scope.wiki.changed) {
                var uniqueSuffix = "?" + new Date().getTime();
                var params = {};
                params.wiki_id = $scope.wiki.wiki_id;
                params.wiki_name = $scope.wiki.wiki_name;
                $http({method: 'POST',
                    url: UserService.appDir + 'php/editWikiName.php' + uniqueSuffix,
                    data: params,
                    headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                }).
                    success(function() {

                    }).
                    error(function(data, status) {
                        alert("Error: " + status + " Edit wiki name failed. Check your internet connection");
                    });
            }
        };

        $scope.editLogoLinkDone = function() {
            if ($scope.wiki.changed_link) {
                var uniqueSuffix = "?" + new Date().getTime();
                var params = {};
                params.logo_link = $scope.wiki.logo_link;
                $http({method: 'POST',
                    url: UserService.appDir + 'php/editLogoLink.php' + uniqueSuffix,
                    data: params,
                    headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                }).
                    success(function() {

                    }).
                    error(function(data, status) {
                        alert("Error: " + status + " Edit logo link failed. Check your internet connection");
                    });
            }
        };

        $scope.editWikiDescription = function() {
            var uniqueSuffix = "?" + new Date().getTime();
            var params = {};
            params.wiki_id = $scope.wiki.wiki_id;
            params.description = tinyMCE.get('wiki-description').getContent();
            $http({method: 'POST',
                url: UserService.appDir + 'php/editWikiDescription.php' + uniqueSuffix,
                data: params,
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).
                success(function() {
                    $scope.wiki.description = params.description;
                }).
                error(function(data, status) {
                    alert("Error: " + status + " Edit wiki name failed. Check your internet connection");
                });
        };

        $scope.deleteAllStudentPosts = function() {

            var uniqueSuffix = "?" + new Date().getTime();
            var params = {};
            params.wiki_id = $scope.wiki.wiki_id;
            $http({method: 'POST',
                url: UserService.appDir + 'php/deleteAllStudentPosts.php' + uniqueSuffix,
                data: params,
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).
                success(function(data) {
                    if (!data) {
                        alert("Error deleting student posts.");
                    }
                }).
                error(function(data, status) {
                    alert("Error: " + status + " Delete student posts failed. Check your internet connection");
                });
        };

        $scope.deletePage = function(page) {
            for (var i = 0; i < $scope.wiki.pages.length; i++) {
                if ($scope.wiki.pages[i].page_id === page.page_id) {
                    $scope.wiki.pages.splice(i,1);
                    break;
                }
            }

            var uniqueSuffix = "?" + new Date().getTime();
            var params = {};
            params.page_id = page.page_id;
            $http({method: 'POST',
                url: UserService.appDir + 'php/deletePage.php' + uniqueSuffix,
                data: params,
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).
                success(function(data) {

                }).
                error(function(data, status) {
                    alert("Error: " + status + " Delete page failed. Check your internet connection");
                });
        };

        $scope.deleteHeading = function(heading) {
            var uniqueSuffix = "?" + new Date().getTime();
            var params = {};
            params.heading_id = heading.heading_id;
            $http({method: 'POST',
                url: UserService.appDir + 'php/deleteHeading.php' + uniqueSuffix,
                data: params,
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).
                success(function() {
                    for (var i = 0; i < $scope.wiki.headings.length; i++) {
                        if ($scope.wiki.headings[i].heading_id === heading.heading_id) {
                            $scope.wiki.headings.splice(i,1);
                            break;
                        }
                    }
                }).
                error(function(data, status) {
                    alert("Error: " + status + " Delete heading failed. Check your internet connection");
                });
        };

        $scope.editPagePrev = function(page) {
            page.prev_changed = true;
        };

        $scope.editPagePrevDone = function(page) {
            if (page.prev_changed) {
                var uniqueSuffix = "?" + new Date().getTime();
                var params = {};
                params.page_id = page.page_id;
                params.prev = page.prev;
                $http({method: 'POST',
                    url: UserService.appDir + 'php/editPagePrev.php' + uniqueSuffix,
                    data: params,
                    headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                }).
                    success(function(data) {
                        if (!data) {
                            alert("Error saving page position.");
                        } else {
                            $scope.wiki.pages = _.sortBy($scope.wiki.pages, ['prev', 'page_name']);
                        }
                    }).
                    error(function(data, status) {
                        alert("Error: " + status + " Edit page position failed. Check your internet connection");
                    });
            }
        };

        $scope.editPage = function(page) {
            page.changed = true;
        };

        $scope.editPageDone = function(page) {
            if (page.changed) {
                var uniqueSuffix = "?" + new Date().getTime();
                var params = {};
                params.page_id = page.page_id;
                params.page_name = page.page_name;
                $http({method: 'POST',
                    url: UserService.appDir + 'php/editPage.php' + uniqueSuffix,
                    data: params,
                    headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                }).
                    success(function(data) {
                        if (!data) {
                            alert("Error saving page name.");
                        } else {
                            $scope.wiki.pages = _.sortBy($scope.wiki.pages, ['prev', 'page_name']);
                        }
                    }).
                    error(function(data, status) {
                        alert("Error: " + status + " Edit page failed. Check your internet connection");
                    });
            }
        };

        $scope.editHeadingPrev = function(heading) {
            heading.prev_changed = true;
        };

        $scope.editHeadingPrevDone = function(heading) {
            if (heading.prev_changed) {
                var uniqueSuffix = "?" + new Date().getTime();
                var params = {};
                params.heading_id = heading.heading_id;
                params.prev = heading.prev;
                $http({method: 'POST',
                    url: UserService.appDir + 'php/editHeadingPrev.php' + uniqueSuffix,
                    data: params,
                    headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                }).
                    success(function(data) {
                        if (!data) {
                            alert("Error saving heading position.");
                        } else {
                            $scope.wiki.headings = _.sortBy($scope.wiki.headings, ['page_id', 'prev', 'heading_id']);
                        }
                    }).
                    error(function(data, status) {
                        alert("Error: " + status + " Edit heading order failed. Check your internet connection");
                    });
            }
        };

        $scope.editHeading = function(heading) {
            heading.changed = true;
        };

        $scope.editHeadingDone = function(heading) {
            if (heading.changed) {
                var uniqueSuffix = "?" + new Date().getTime();
                var params = {};
                params.heading_id = heading.heading_id;
                params.heading_name = heading.heading_name;
                $http({method: 'POST',
                    url: UserService.appDir + 'php/editHeading.php' + uniqueSuffix,
                    data: params,
                    headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                }).
                    success(function(data) {
                        if (!data) {
                            alert("Error saving heading position.");
                        } else {
                            $scope.wiki.headings = _.sortBy($scope.wiki.headings, ['page_id', 'prev', 'heading_id']);
                        }
                    }).
                    error(function(data, status) {
                        alert("Error: " + status + " Edit heading failed. Check your internet connection");
                    });
            }
        };

        $scope.confirmDelete = function (name, row, deleteFxn) {
            var modalInstance = $modal.open({
                templateUrl: 'confirmModal.html',
                controller: 'ConfirmModalCtrl',
                backdrop: false,
                resolve: {
                    name: function () {
                        return name;
                    }
                }
            });

            modalInstance.result.then(function () {
                deleteFxn(row);
            });
        };

  });

angular.module('wikiApp').
    controller('ConfirmModalCtrl', function ($scope, $modalInstance, name) {

        $scope.itm = {name:name};

        $scope.ok = function () {
            $modalInstance.close();
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    });
