'use strict';

angular.module('wikiApp')
  .controller('PageviewsCtrl', function ($scope, $location, UserService, uiGridConstants) {
        if (UserService.wiki.wiki_id === 0 || UserService.user.priv_level < 2) {
            $location.path('/');
            return;
        }
        $scope.wiki = UserService.wiki;

        $scope.pagesGridOptions = {
            showGridFooter: true,
            showColumnFooter: true,
            enableFiltering: true,
            enableSorting: true,
            enableRowSelection: false,
            enableGroupHeaderSelection: true,
            multiSelect: false,
            enableGridMenu: true,
            enableCellEditOnFocus: false,
            columnDefs: [{field:'user_name', displayName:'Name', type:'string', aggregationType: uiGridConstants.aggregationTypes.count},
                {field:'page_name', displayName:'Page', visible:true, type:'string'},
                {field:'view_count', displayName:'Views', width:'150',cellClass:'numericCol',filters: [
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


        $scope.pagesGridOptions.onRegisterApi = function(gridApi){

        };


        if ($scope.wiki.page_views.length === 0) {
            var db_call = UserService.getPageViews();
            db_call.success(function(data) {
                angular.forEach(data.page_views, function(v) {
                    v.view_count = parseInt(v.view_count);
                });
                UserService.wiki.page_views = data.page_views;
                $scope.pagesGridOptions.data = UserService.wiki.page_views;
            })
        } else {
            $scope.pagesGridOptions.data = UserService.wiki.page_views;
        }

  });
