myApp.config(function ($stateProvider, $urlRouterProvider) {

    $stateProvider
      .state('tabs', {
        url: "/tab",
        abstract: true,
        templateUrl: "templates/tabs.html"
      })
      .state('tabs.home', {
        url: "/home",
        views: {
          'home-tab': {
            templateUrl: "templates/home.html",
            controller: 'TodoCtrl'
          }
        }
      })

      .state('tabs.about', {
        url: "/about",
        views: {
          'about-tab': {
            templateUrl: "templates/about.html",
            controller: 'TodoCtrl'
          }
        }
      });


    $urlRouterProvider.otherwise("/tab/home");

  })

  .factory('Projects', function () {
    return {
      all: function () {
        var projectString = window.localStorage['projects'];
        if (projectString) {
          return angular.fromJson(projectString);
        }
        return [];
      },
      save: function (projects) {
        window.localStorage['projects'] = angular.toJson(projects);
      },
      newProject: function (projectTitle) {
        // Add a new project
        return {
          title: projectTitle,
          tasks: []
        };
      },
      getLastActiveIndex: function () {
        return parseInt(window.localStorage['lastActiveProject']) || 0;
      },
      setLastActiveIndex: function (index) {
        window.localStorage['lastActiveProject'] = index;
      },

    }
  })

  