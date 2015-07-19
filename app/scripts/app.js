'use strict';

var wikiApp = angular.module('wikiApp', ['ngSanitize','ngRoute','ui.bootstrap',
    'ui.grid', 'ui.grid.grouping', 'ui.grid.selection',
    'ui.grid.autoResize', 'ui.grid.selection',
    'flow'])
  .config(['$routeProvider', '$locationProvider', '$sceProvider', function($routeProvider, $locationProvider, $sceProvider) {
        $locationProvider.html5Mode(false);
        $sceProvider.enabled(false);
        $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
        .when('/page/:page_id/:heading_id?/:post_id?', {
            templateUrl: 'views/main.html',
            controller: 'MainCtrl'
        })
      .when('/settings', {
        templateUrl: 'views/settings.html',
        controller: 'SettingsCtrl'
      })
      .when('/admin', {
        templateUrl: 'views/admin.html',
        controller: 'AdminCtrl'
      })
      .when('/stats', {
        templateUrl: 'views/stats.html',
        controller: 'StatsCtrl'
      })
      .when('/pageviews', {
        templateUrl: 'views/pageviews.html',
        controller: 'PageviewsCtrl'
      })
      .when('/search', {
        templateUrl: 'views/search.html',
        controller: 'SearchCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
    }]);
