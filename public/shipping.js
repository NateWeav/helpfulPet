// Define AngularJS application and controller
var app = angular.module('shippingApp', []);

app.controller('ShippingController', function($scope) {
    $scope.shipping = {}; // Initialize shipping object
    $scope.submitted = false; // Flag to check if the form was submitted

    // Function to handle form submission
    $scope.submitShippingDetails = function() {
        if ($scope.shipping.address && $scope.shipping.carrier && $scope.shipping.method) {
            // Set submitted to true to display the details
            $scope.submitted = true;

            $.ajax({
                url: 'notrealyet',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify($scope.shipping),
                success: function(response) {
                    // Handle successful response
                },
                error: function(error) {
                    // Handle error
                }
            });
        } else {
            alert('Please fill all fields.');
        }
    };
});
