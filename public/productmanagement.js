$(document).ready(function() {
    const productList = [];

    // Handle form submission
    $('#productForm').on('submit', function(event) {
        event.preventDefault();

        // Gather form data
        const productId = $('#productId').val().trim();
        const description = $('#description').val().trim();
        const category = $('#category').val().trim();
        const unitOfMeasure = $('#unitOfMeasure').val().trim();
        const price = parseFloat($('#price').val());
        const weight = parseFloat($('#weight').val()) || null;

        // Validate data
        if (!productId || !description || !category || !unitOfMeasure || isNaN(price)) {
            alert('Please fill out all required fields correctly.');
            return;
        }

        // Create a product object
        const product = {
            productId,
            description,
            category,
            unitOfMeasure,
            price,
            weight
        };

        // Add product to the list
        productList.push(product);

        // Update the product display
        updateProductList();
        alert('Product saved successfully!');
    });

    // Function to update the product list display
    function updateProductList() {
        const productListDiv = $('#productList');
        productListDiv.empty(); // Clear previous content

        productList.forEach((product, index) => {
            const productCard = `
                <div class="card">
                    <h5 class="card-title">${product.description}</h5>
                    <p class="card-text">Product ID: ${product.productId}</p>
                    <p class="card-text">Category: ${product.category}</p>
                    <p class="card-text">Unit of Measure: ${product.unitOfMeasure}</p>
                    <p class="card-text">Price: $${product.price.toFixed(2)}</p>
                    <p class="card-text">Weight: ${product.weight ? product.weight + ' lbs' : 'N/A'}</p>
                </div>
            `;
            productListDiv.append(productCard);
        });
    }

    // Function to download JSON as a file
    function downloadJSON() {
        const jsonContent = JSON.stringify(productList, null, 2);
        const blob = new Blob([jsonContent], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        // Create an anchor element and trigger a download
        const a = document.createElement('a');
        a.href = url;
        a.download = 'products.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // Event listener for download button
    $('#downloadJsonBtn').on('click', downloadJSON);

    // Initialize product list on page load
    updateProductList();
});
