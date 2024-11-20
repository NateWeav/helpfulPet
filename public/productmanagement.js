$(document).ready(function() {
    // Load products on page load
    loadProducts();

    // Handle form submission
    $('#productForm').on('submit', function(event) {
        event.preventDefault();

        const product = {
            productId: $('#productId').val().trim(),
            description: $('#description').val().trim(),
            category: $('#category').val().trim(),
            unitOfMeasure: $('#unitOfMeasure').val().trim(),
            price: parseFloat($('#price').val()),
            weight: parseFloat($('#weight').val()) || null
        };

        // Validate data
        if (!product.productId || !product.description || !product.category || 
            !product.unitOfMeasure || isNaN(product.price)) {
            alert('Please fill out all required fields correctly.');
            return;
        }

        // Send POST request to create product
        $.ajax({
            url: '/products',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(product),
            success: function(response) {
                alert('Product saved successfully!');
                loadProducts();
                $('#productForm')[0].reset();
            },
            error: function(xhr) {
                alert('Error saving product: ' + xhr.responseJSON.error);
            }
        });
    });

    function loadProducts() {
        $.get('/products', function(products) {
            const productListDiv = $('#productList');
            productListDiv.empty();

            products.forEach(product => {
                const productCard = `
                    <div class="card mb-3">
                        <div class="card-body">
                            <h5 class="card-title">${product.description}</h5>
                            <p class="card-text">Product ID: ${product.productId}</p>
                            <p class="card-text">Category: ${product.category}</p>
                            <p class="card-text">Unit of Measure: ${product.unitOfMeasure}</p>
                            <p class="card-text">Price: $${product.price.toFixed(2)}</p>
                            <p class="card-text">Weight: ${product.weight ? product.weight + ' lbs' : 'N/A'}</p>
                            <button class="btn btn-warning btn-sm edit-product" data-id="${product._id}">Edit</button>
                            <button class="btn btn-danger btn-sm delete-product" data-id="${product._id}">Delete</button>
                        </div>
                    </div>
                `;
                productListDiv.append(productCard);
            });
        });
    }

    // Handle delete button clicks
    $(document).on('click', '.delete-product', function() {
        const productId = $(this).data('id');
        if (confirm('Are you sure you want to delete this product?')) {
            $.ajax({
                url: `/products/${productId}`,
                type: 'DELETE',
                success: function() {
                    loadProducts();
                },
                error: function(xhr) {
                    alert('Error deleting product: ' + xhr.responseJSON.error);
                }
            });
        }
    });

    // Handle edit button clicks
    $(document).on('click', '.edit-product', function() {
        const productId = $(this).data('id');
        $.get(`/products/${productId}`, function(product) {
            $('#productId').val(product.productId);
            $('#description').val(product.description);
            $('#category').val(product.category);
            $('#unitOfMeasure').val(product.unitOfMeasure);
            $('#price').val(product.price);
            $('#weight').val(product.weight);
            
            // Change form to update mode
            $('#productForm').attr('data-mode', 'update');
            $('#productForm').attr('data-id', product._id);
            $('button[type="submit"]').text('Update Product');
        });
    });
});