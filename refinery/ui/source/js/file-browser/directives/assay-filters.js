'use strict';

function rpFileBrowserAssayFilters ($timeout, $location) {
  return {
    restrict: 'E',
    templateUrl: '/static/partials/file-browser/partials/assay-filters.html',
    controller: 'FileBrowserCtrl',
    controllerAs: 'FBCtrl',
    bindToController: {
      attributeFilter: '@',
      analysisFilter: '@'
    },
    link: function (scope) {
      // ng-click event for attribute filter panels
      scope.dropAttributePanel = function (e, attributeName, attributeObj) {
        e.preventDefault();
        var escapeAttributeName = attributeName.replace(' ', '-');
        var attributeTitle = angular.element(
          document.querySelector('#attribute-panel-' + escapeAttributeName)
        );
        var attribute = angular.element(
          document.querySelector('#' + escapeAttributeName)
        );
        var selectedKeys = Object.keys(scope.FBCtrl.selectedFieldList);
        var selectedAttributeIndex = selectedKeys.indexOf(attributeObj.internal_name);
        if (attributeTitle.hasClass('fa-caret-right')) {
          // open panel
          attributeTitle.removeClass('fa-caret-right');
          attributeTitle.addClass('fa-caret-down');
          attribute.addClass('in');
        } else if (selectedAttributeIndex > -1) {
          // keep panel open when some fields are selected showFields method
          // will hide any non-selected fields
          attributeTitle.removeClass('fa-caret-down');
          attributeTitle.addClass('fa-caret-right');
        } else {
          // collapse entire panel when none are selected
          attributeTitle.removeClass('fa-caret-down');
          attributeTitle.addClass('fa-caret-right');
          attribute.removeClass('in');
        }
      };

      // Helper method Checks to see if panel is minimized based on caret
      var isMinimized = function (index) {
        var attributeTitle = angular.element(
          document.querySelector('#attribute-panel-' + index)
        );
        return attributeTitle.hasClass('fa-caret-right');
      };

      // Drop down windows when they are in the URL query
      scope.$on('rf/attributeFilter-ready', function () {
        scope.generateFilterDropSelection();
      });

      // When panel is minimized, selected fields continue to show
      scope.showField = function (field, internalName, attributeName) {
        var escapedAttributeName = attributeName.replace(' ', '-');
        var selectedIndex = -1;
        if (scope.FBCtrl.selectedFieldList[internalName] !== undefined) {
          selectedIndex = scope.FBCtrl.selectedFieldList[internalName].indexOf(field);
        }
        if (!isMinimized(escapedAttributeName)) {
          return true;
        } else if (selectedIndex > -1 && isMinimized(escapedAttributeName)) {
          return true;
        }
        return false;
      };

      // Loops through fields to find matching attributes and drops down panel
      var updateDomDropdown = function (allFields, queryFields, attributeName,
                                        attributeInternalName) {
        for (var ind = 0; ind < allFields.length; ind++) {
          if (queryFields.indexOf(allFields[ind]) > -1) {
            var escapeAttributeName = attributeName.replace(' ', '-');
            var attributeTitle = angular.element(
            document.querySelector('#attribute-panel-' + escapeAttributeName)
            );
            // mark checkbox for selected item
            scope.FBCtrl.selectedField[allFields[ind]] = true;

            if (attributeTitle.hasClass('fa-caret-right')) {
              angular.element(
              document.querySelector('#' + escapeAttributeName)).addClass('in');
              attributeTitle.removeClass('fa-caret-right');
              attributeTitle.addClass('fa-caret-down');
              scope.FBCtrl.selectedFieldList[attributeInternalName] = [allFields[ind]];
            } else {
              scope.FBCtrl.selectedFieldList[attributeInternalName].push(allFields[ind]);
            }
          }
        }
      };

      scope.generateFilterDropSelection = function () {
        var queryFields = Object.keys($location.search());
        var allFilters = {};
        angular.copy(scope.FBCtrl.attributeFilter, allFilters);

        if (typeof scope.FBCtrl.analysisFilter.Analysis !== 'undefined') {
          allFilters.Analysis = scope.FBCtrl.analysisFilter.Analysis;
        }
        angular.forEach(allFilters, function (attributeObj, attributeName) {
          var allFields = [];
          angular.forEach(attributeObj.facetObj, function (fieldObj) {
            allFields.push(fieldObj.name);
          });

          // time out allows the dom to load
          $timeout(function () {
            updateDomDropdown(allFields, queryFields, attributeName, attributeObj.internal_name);
          }, 0);
        });
      };
    }
  };
}

angular
  .module('refineryFileBrowser')
  .directive('rpFileBrowserAssayFilters', [
    '$timeout',
    '$location',
    rpFileBrowserAssayFilters
  ]
);
