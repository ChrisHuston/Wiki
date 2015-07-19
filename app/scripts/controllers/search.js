'use strict';

angular.module('wikiApp')
  .controller('SearchCtrl', function ($scope, SearchService, $location, UserService) {
        $scope.search = SearchService.search;
        $scope.gotoPost = function(post) {
            $location.path('/page/' + post.page_id + '/' + post.heading_id + '/p_' + post.post_id);
        }
  });
