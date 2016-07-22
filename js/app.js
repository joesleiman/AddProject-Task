angular.module('todo', ['ionic', 'ngCordova'])

  .config(function ($stateProvider, $urlRouterProvider) {

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
            templateUrl: "home.html",
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

  .controller('TodoCtrl', function ($scope, $timeout, $ionicModal, Projects, $ionicSideMenuDelegate, $cordovaGeolocation) {
          var options = {timeout: 10000, enableHighAccuracy: true};
 
  $cordovaGeolocation.getCurrentPosition(options).then(function(position){
 
    var latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
 
    var mapOptions = {
      center: latLng,
      zoom: 15,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };
 
    $scope.map = new google.maps.Map(document.getElementById("map"), mapOptions);
 
  }, function(error){
    console.log("Could not get location");
  });
    // A utility function for creating a new project
    // with the given projectTitle
    var createProject = function (projectTitle) {
      var newProject = Projects.newProject(projectTitle);
      $scope.projects.push(newProject);
      Projects.save($scope.projects);
      $scope.selectProject(newProject, $scope.projects.length - 1);
    }


    // Load or initialize projects
    $scope.projects = Projects.all();

    // Grab the last active, or the first project
    $scope.activeProject = $scope.projects[Projects.getLastActiveIndex()];

    // Called to create a new project
    $scope.newProject = function () {
      var projectTitle = prompt('Project name');
      if (projectTitle) {
        createProject(projectTitle);
      }
    };

    // Called to select the given project
    $scope.selectProject = function (project, index) {
      $scope.activeProject = project;
      Projects.setLastActiveIndex(index);
      $ionicSideMenuDelegate.toggleLeft(true);


    };
    $scope.deleteTask = function (project, index) {
      project.splice(index, 1);
      var b = angular.fromJson(window.localStorage['projects']);
      var k = Projects.getLastActiveIndex();
      b[k].tasks.splice(index, 1);
      window.localStorage['projects'] = angular.toJson(b);
    };
    $scope.deleteProjectWithTasks = function (project, index) {
      $scope.selectProject(project, index);
      $scope.projects.splice(Projects.getLastActiveIndex(), 1);
      $scope.activeProject.tasks.splice(0, $scope.activeProject.tasks.length);
      var b = angular.fromJson(window.localStorage['projects']);
      b.splice(Projects.getLastActiveIndex(), 1);
      window.localStorage['projects'] = angular.toJson(b);
      if ($scope.projects.length === 0) {
        while (true) {
          var projectTitle = prompt('Your first project title:');
          if (projectTitle) {
            createProject(projectTitle);
            break;
          }
        }
      }
      else {
        if (index === 0 && $scope.projects.length > 1) {
          $scope.selectProject($scope.projects[0], 0);
        } else {
          $scope.selectProject($scope.projects[index - 1], index - 1);
        }

      }
    };
    
    /* $(function () {
       $("body").click(function (e) {
         if (e.target.id == "delete") {
          
         }
       });
     })*/

    // Create our modal
    $ionicModal.fromTemplateUrl('modal.html', function (modal) {
      $scope.taskModal = modal;
    }, {
        scope: $scope
      });

    $scope.createTask = function (task) {
      if (!$scope.activeProject || !task) {
        return;
      }
      $scope.activeProject.tasks.push({
        title: task.title
      });
      $scope.taskModal.hide();

      // Inefficient, but save all the projects
      Projects.save($scope.projects);

      task.title = "";
    };

    $scope.newTask = function () {
      $scope.taskModal.show();
    };

    $scope.closeNewTask = function () {
      $scope.taskModal.hide();
    };

    $scope.toggleProjects = function () {
      $ionicSideMenuDelegate.toggleLeft();
    };


    // Try to create the first project, make sure to defer
    // this by using $timeout so everything is initialized
    // properly
    $timeout(function () {
      if ($scope.projects.length == 0) {
        while (true) {
          var projectTitle = prompt('Your first project title:');
          if (projectTitle) {
            createProject(projectTitle);
            break;
          }
        }
      }
    }, 1000);
    
  

  })
  