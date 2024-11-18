var app = angular.module('billingApp', []);

app.controller('BillingController', function($scope) {
    $scope.billing = {}; // Initialize billing object
    $scope.submitted = false; // Flag for form submission

    // Submit billing details
    $scope.submitBillingDetails = function() {
        if ($scope.billing.name && $scope.billing.cardNumber && $scope.billing.expiryDate && $scope.billing.cvv) {
            $scope.submitted = true;

            //Send billing details to a server via AJAX
            $.ajax({
                url: 'surely-one-day',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify($scope.billing),
                success: function(response) {
                    console.log("Billing details submitted successfully.");
                },
                error: function(error) {
                    console.error("Error submitting billing details:", error);
                }
            });
        } else {
            alert('Please fill all fields.');
        }
    };
});
