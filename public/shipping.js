// shipping.js

var app = angular.module('shippingApp', []);

app.controller('ShippingController', function($scope) {
    $scope.shipping = {}; // Initialize shipping object

    // Function to handle form submission
    $scope.submitShippingDetails = function() {
        if ($scope.shipping.address && $scope.shipping.carrier && $scope.shipping.method) {
            $.ajax({
                url: '/shipping',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify($scope.shipping),
                success: function(response) {
                    // Redirect to billing.html upon successful submission
                    window.location.href = 'billing.html';
                },
                error: function(error) {
                    // Handle error
                    alert('Error saving shipping details.');
                }
            });
        } else {
            alert('Please fill all fields.');
        }
    };
});