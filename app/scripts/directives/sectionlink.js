'use strict';

angular.module('wikiApp')
  .directive('sectionLink', function () {
        return {
            template: '<a href="javascipt:void(0)" ng-click="fxn(section)">{{txt}}</a>',
            restrict: 'A',
            transclude:true,
            scope: {
                fxn:'=',
                section:'@',
                txt:'@'
            },
            link: function(scope, element, attr) {
                scope.$watch(attr.section, function(scope) {
                    scope.fxn = scope.linkClick;
                    scope.txt = attr.txt;
                    scope.section = attr.section;
                    $compile(element.contents())(scope);
                }, true);
            }
        };
  });
