// productdisplay.js

$(document).ready(function() {
    let products = [];
    let shopperId = null;

    // Fetch current shopper ID
    fetch('/current-shopper')
    .then(response => response.json())
    .then(data => {
        if (data.shopperId) {
            shopperId = data.shopperId;
            loadProducts();
        } else {
            // Redirect to login page if not authenticated
            window.location.href = 'login.html';
        }
    });

    function loadProducts() {
        // Fetch products from server
        $.get('/products', function(data) {
            products = data;
            displayProducts(products);
        });
    }

    // Display products
    function displayProducts(productArray) {
        $('#productList').empty();
        productArray.forEach(product => {
            $('#productList').append(`
                <div class="col-md-4">
                    <div class="card mb-4">
                        <img src="${product.image}" class="card-img-top" alt="${product.name}">
                        <div class="card-body">
                            <h5 class="card-title">${product.name}</h5>
                            <p class="card-text">Product Id: ${product._id}</p>
                            <p class="card-text">Description: ${product.description}</p>
                            <p class="card-text">Category: ${product.category}</p>
                            <p class="card-text">Price: $${product.price.toFixed(2)}</p>
                            <button class="btn btn-primary add-to-cart-btn" data-id="${product._id}">Add to Cart</button>
                        </div>
                    </div>
                </div>
            `);
        });
    }

    // Add to cart
    $('#productList').on('click', '.add-to-cart-btn', function() {
        const productId = $(this).data('id');
        $.ajax({
            url: '/cart/add',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
                shopperId: shopperId,
                productId: productId,
                quantity: 1
            }),
            success: function() {
                updateCartDisplay();
            },
            error: function(error) {
                console.error('Add to cart error:', error);
            }
        });
    });

    // Update cart display
    function updateCartDisplay() {
        $.get(`/cart/${shopperId}`, function(cart) {
            const itemCount = cart.items.reduce((total, item) => total + item.quantity, 0);
            $('#cart-count').text(itemCount);
            $('#cart-items').empty();
            let total = 0;
            cart.items.forEach(item => {
                const itemTotal = (item.product.price * item.quantity).toFixed(2);
                total += parseFloat(itemTotal);
                $('#cart-items').append(`
                    <li class="list-group-item d-flex justify-content-between align-items-center">
                        ${item.product.name} x${item.quantity} - $${itemTotal}
                        <div>
                            <button class="btn btn-secondary btn-sm decrease-quantity-btn" data-id="${item.product._id}">-</button>
                            <button class="btn btn-secondary btn-sm increase-quantity-btn" data-id="${item.product._id}">+</button>
                            <button class="btn btn-danger btn-sm remove-from-cart-btn" data-id="${item.product._id}">Remove</button>
                        </div>
                    </li>
                `);
            });
            $('#cart-total').text(total.toFixed(2));
        });
    }

    // Increase quantity
    $('#cart-items').on('click', '.increase-quantity-btn', function() {
        const productId = $(this).data('id');
        updateQuantity(productId, 1);
    });

    // Decrease quantity
    $('#cart-items').on('click', '.decrease-quantity-btn', function() {
        const productId = $(this).data('id');
        updateQuantity(productId, -1);
    });

    // Update item quantity
    function updateQuantity(productId, delta) {
        $.get(`/cart/${shopperId}`, function(cart) {
            const item = cart.items.find(item => item.product._id === productId);
            if (item) {
                const newQuantity = item.quantity + delta;
                $.ajax({
                    url: '/cart/update',
                    method: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify({
                        shopperId: shopperId,
                        productId: productId,
                        quantity: newQuantity
                    }),
                    success: function() {
                        updateCartDisplay();
                    },
                    error: function(error) {
                        console.error('Update cart error:', error);
                    }
                });
            }
        });
    }

    // Remove from cart
    $('#cart-items').on('click', '.remove-from-cart-btn', function() {
        const productId = $(this).data('id');
        $.ajax({
            url: '/cart/remove',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
                shopperId: shopperId,
                productId: productId
            }),
            success: function() {
                updateCartDisplay();
            },
            error: function(error) {
                console.error('Remove from cart error:', error);
            }
        });
    });

    // Show cart modal
    $('#cart-icon').on('click', function() {
        updateCartDisplay();
        $('#cartModal').modal('show');
    });

    // Checkout
    $('#checkoutButton').on('click', function() {
        $.ajax({
            url: '/checkout',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ shopperId: shopperId }),
            success: function(response) {
                $('#cartModal').modal('hide');
                window.location.href = 'shipping.html';
            },
            error: function(error) {
                console.error('Checkout error:', error);
                alert('Error processing checkout. Please try again.');
            }
        });
    });
});