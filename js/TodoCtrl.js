myApp.controller('TodoCtrl', function ($scope, $timeout, $ionicModal, Projects, $ionicSideMenuDelegate) {

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
        if (projectTitle && confirmProjectTitle(projectTitle)) {
            createProject(projectTitle);
        } else {
            if (!confirmProjectTitle(projectTitle)) {
                alert("you can't use the same name project");
            } else {
                alert("enter a valid title");
            }

        }
    };
    confirmProjectTitle = function (projectTitle) {
        var b = angular.fromJson(window.localStorage['projects']);
        for (var i = 0; i < b.length; i++) {
            if (b[i].title == projectTitle) {
                return false;
            }

        }
        return true;
    }
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
    $ionicModal.fromTemplateUrl('templates/modal.html', function (modal) {
        $scope.taskModal = modal;
    }, {
            scope: $scope
        });
    confirmTaskTitle = function (taskTitle) {
        var b = angular.fromJson(window.localStorage['projects']);
        for (var i = 0; i < b.length; i++) {
            for (var j = 0; j < b[i].tasks.length; j++) {
                if (b[i].tasks[j].title == taskTitle) {
                    return false;
                }
            }
        }
        return true;
    }
    //Create task
    $scope.createTask = function (task) {
        if (!$scope.activeProject || !task.title || task.startDate == null || task.endDate == null || !confirmTaskTitle(task.title)) {
            return;
        }

        task.startDate = task.startDate.getDate() + "-" + task.startDate.getMonth() + "-" + task.startDate.getFullYear();
        task.endDate = task.endDate.getDate() + "-" + task.endDate.getMonth() + "-" + task.endDate.getFullYear();
        $scope.activeProject.tasks.push({
            title: task.title,
            startDate: task.startDate,
            endDate: task.endDate
        });
        $scope.taskModal.hide();

        // Inefficient, but save all the projects
        Projects.save($scope.projects);

        task.title = "";
        task.startDate = new Date();
        task.endDate = "";
    }; // end create task

    $scope.newTask = function () {
        $scope.taskModal.show();
        var toDay = new Date();
        var minDate = toDay.toISOString().substring(0, 10);

        var inputStartDate = document.getElementById("startDate");
        var inputEndDate = document.getElementById("endDate");
        inputStartDate.setAttribute('min', minDate);
        inputEndDate.setAttribute('min', minDate);
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
