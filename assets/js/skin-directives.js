import angular from 'angular';

const skin = angular.module('app.skinDirectives', []);

skin.directive('designPanel', () => {
  return {
    restrict: 'E',
    templateUrl: '/partials/design-panel.html',
    require: '^MainController'
  }
});

skin.directive('applicationView', () => {
  return {
    restrict: 'E',
    templateUrl: '/partials/application-view.html',
    transclude: true
  }
});

skin.directive('pageListNav', () => {
  return {
    restrict: 'E',
    template: `<widget type="page-list" non-configurable></widget>`
  }
});

skin.directive('languageSelectorNav', () => {
  return {
    restrict: 'E',
    template: `
      <widget type="language-selector"
              config="widget">
      </widget>`,
    link(scope) {
      scope.widget = {showFlags: true}
    }
  }
});

skin.directive('logoutButton', () => {
  return {
    restrict: 'E',
    templateUrl: '/partials/logout-button.html'
  }
});

skin.directive('loginGoogleButton', () => {
  return {
    restrict: 'E',
    templateUrl: '/partials/login-google-button.html'
  }
});
