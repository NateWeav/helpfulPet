var app = angular.module('returnsApp', []);

app.controller('ReturnsController', function($scope) {
    $scope.orders = [];
    $scope.returnedProducts = [];

    // Fetch orders from the server
    $.ajax({
        url: '/orders',
        type: 'GET',
        success: function(response) {
            $scope.$apply(function() {
                $scope.orders = response;
            });
        },
        error: function(error) {
            console.error("Error fetching orders:", error);
        }
    });

    // Add product to returns list
    $scope.returnProduct = function(order, product) {
        $scope.returnedProducts.push({ orderId: order._id, product });

        // Send return details to the server
        $.ajax({
            url: '/returns',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify($scope.returnedProducts),
            success: function(response) {
                console.log("Return details submitted successfully.");
            },
            error: function(error) {
                console.error("Error submitting return details:", error);
            }
        });
    };
});