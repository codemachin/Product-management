myApp.directive('myModal', function() {
   return {
     restrict: 'A',
     link: function(scope, element, attr) {
       scope.dismiss = function() {
           $(element).modal('hide');
       };
     }
   } 
});

//////////////////////// directive to hide bootstrap modal from parent controller //////////////////////////

