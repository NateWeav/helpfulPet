var app = angular.module('returnsApp', []);

app.controller('ReturnsController', function($scope) {
    // Sample products (usually fetched from a server)
    $scope.products = [
        { id: "001", name: "Chuckit! Ultra Ball", price: 9.99 },
        { id: "002", name: "Comfortable Dog Bed", price: 49.99 },
        { id: "003", name: "Boston Anti-Pull Harness", price: 29.99 },
        { id: "004", name: "Bow Tie Collar", price: 14.99 },
        { id: "005", name: "Flower Design Collar", price: 16.99 }
    ];
    $scope.returnedProducts = [];

    // Add product to returns list
    $scope.returnProduct = function(product) {
        $scope.returnedProducts.push(product);

        //Send return details to a server via AJAX
        $.ajax({
            url: 'not-yet',
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
